-- Calls the import worker every minute so a batch keeps going after the
-- admin closes the import tab.
--
-- The worker URL and secret live in Supabase Vault, not in this file. After
-- deploying, run once in the SQL editor (see README "Supabase setup"):
--
--   select vault.create_secret('https://YOUR_ROOT_DOMAIN/api/worker', 'import_worker_url');
--   select vault.create_secret('YOUR_WORKER_SECRET', 'import_worker_secret');
--
-- Until both secrets exist the job does nothing.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create or replace function public.invoke_import_worker()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  -- Only call out when there is work: queued rows, or rows a dead worker left
  -- running (claim_import_jobs puts those back in the queue).
  if not exists (
    select 1
      from public.import_jobs
     where (status = 'queued' and run_after <= now())
        or (status = 'running' and locked_at < now() - interval '10 minutes')
  ) then
    return;
  end if;

  select decrypted_secret into v_url
    from vault.decrypted_secrets
   where name = 'import_worker_url'
   limit 1;

  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'import_worker_secret'
   limit 1;

  if v_url is null or v_secret is null then
    return;
  end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := '{}'::jsonb,
    -- Matches the worker's maxDuration so the request isn't cut off mid-batch.
    timeout_milliseconds := 300000
  );
end;
$$;

revoke all on function public.invoke_import_worker() from public, anon, authenticated;

select cron.schedule(
  'minitebuild-import-worker',
  '* * * * *',
  $$select public.invoke_import_worker()$$
);

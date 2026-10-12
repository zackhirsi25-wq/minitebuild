-- Public build flow, template library and checkout consent.
--
-- Same access model as the rest of the schema: RLS on, no policies, table
-- privileges revoked from anon and authenticated. Only the server (service
-- role) touches these tables.

-- ---------------------------------------------------------------------------
-- 1. Templates now come from the app's template registry (one folder per
--    template), so the database checks the format of the name, not a fixed
--    list. Existing sites move from the original three names to the new ones.
-- ---------------------------------------------------------------------------

alter table public.businesses drop constraint if exists businesses_template_check;

update public.businesses
   set template = case template
                    when 'bold' then 'cinematic'
                    when 'classic' then 'gallery'
                    when 'split' then 'impact'
                    else template
                  end
 where template in ('bold', 'classic', 'split');

alter table public.businesses alter column template set default 'cinematic';
alter table public.businesses
  add constraint businesses_template_format check (template ~ '^[a-z][a-z0-9-]{1,40}$');

-- ---------------------------------------------------------------------------
-- 2. New business columns
-- ---------------------------------------------------------------------------

alter table public.businesses
  -- Palette chosen for the template; null = picked by a hash of the slug.
  add column palette text check (palette is null or palette ~ '^[a-z][a-z0-9-]{0,40}$'),
  -- 'admin' (import or single add) or 'public' (built from the home page).
  add column source text not null default 'admin' check (source in ('admin', 'public')),
  -- SHA-256 of the secret edit token held in the builder's cookie; lets the
  -- person who built a preview change its design.
  add column edit_token_hash text,
  -- Unpaid public previews stop being served after this time.
  add column expires_at timestamptz;

create index businesses_expires_idx on public.businesses (expires_at) where expires_at is not null;

-- ---------------------------------------------------------------------------
-- 3. Public read: include the palette; expired unpaid previews are not found.
-- ---------------------------------------------------------------------------

create or replace function public.get_public_site(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug', b.slug,
    'status', b.status,
    'template', b.template,
    'palette', b.palette,
    'trade', b.trade,
    'name', b.name,
    'city', b.city,
    'phone', b.phone,
    'address', b.address,
    'hours', to_jsonb(b.hours),
    'category', b.category,
    'content', b.content,
    'images', b.images,
    'updatedAt', b.updated_at
  )
  from public.businesses b
  where b.slug = lower(p_slug)
    and not (b.status = 'preview' and b.expires_at is not null and b.expires_at < now());
$$;

-- ---------------------------------------------------------------------------
-- 4. Build drafts: progress through the build flow, keyed by a cookie token.
-- ---------------------------------------------------------------------------

create table public.build_drafts (
  id uuid primary key default gen_random_uuid(),
  -- SHA-256 of the random token in the builder's httpOnly cookie.
  token_hash text not null unique,
  -- Details, Google match, uploaded photos, chosen template (validated by the app).
  data jsonb not null default '{}'::jsonb,
  business_id uuid references public.businesses (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger build_drafts_set_updated_at
  before update on public.build_drafts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Rate limits for the public flow (per hashed IP and per phone number).
-- ---------------------------------------------------------------------------

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

-- Counts one hit for p_key in the current fixed window and says whether it
-- is still within p_max.
create or replace function public.hit_rate_limit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1
  returning count into v_count;
  return v_count <= p_max;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Checkout consent: who agreed to which version of the policies, and when.
-- ---------------------------------------------------------------------------

-- Kept when the business is deleted: business_id becomes null and the name
-- and slug recorded at acceptance still say whose agreement it was.
create table public.terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses (id) on delete set null,
  business_name text not null,
  business_slug text not null,
  plan text not null check (plan in ('monthly', 'annual')),
  -- SHA-256 of each document's text as shown: {"terms": "...", "privacy": "...", "refunds": "..."}
  documents jsonb not null,
  ip_hash text,
  user_agent text,
  accepted_at timestamptz not null default now()
);

create index terms_acceptances_business_idx on public.terms_acceptances (business_id, accepted_at desc);

-- ---------------------------------------------------------------------------
-- 7. Billing records outlive the business. Subscriptions used to be deleted
--    with it; now business_id becomes null and the name and slug are copied
--    onto the row just before the business is deleted. (billing_events
--    already used on delete set null.)
-- ---------------------------------------------------------------------------

alter table public.subscriptions
  add column business_name text,
  add column business_slug text,
  alter column business_id drop not null,
  drop constraint subscriptions_business_id_fkey,
  add constraint subscriptions_business_id_fkey
    foreign key (business_id) references public.businesses (id) on delete set null;

create or replace function public.keep_billing_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.subscriptions
     set business_name = old.name, business_slug = old.slug
   where business_id = old.id;
  return old;
end;
$$;

revoke all on function public.keep_billing_identity() from public, anon, authenticated;

create trigger businesses_keep_billing_identity
  before delete on public.businesses
  for each row execute function public.keep_billing_identity();

-- ---------------------------------------------------------------------------
-- 8. Row-level security and grants
-- ---------------------------------------------------------------------------

alter table public.build_drafts enable row level security;
alter table public.rate_limits enable row level security;
alter table public.terms_acceptances enable row level security;

revoke all on table public.build_drafts, public.rate_limits, public.terms_acceptances from anon, authenticated;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 9. Sites due for deletion (read by the app's nightly cleanup, which deletes
--    their photos from storage and then the rows; storage files can't be
--    removed from SQL).
--
--    expired: an unpaid public preview, 30 days past its expires_at.
--    canceled: every subscription is canceled, the last one more than
--      p_retention_days ago, and the site isn't live. The app passes
--      retentionDays from src/config/legal.ts and skips this when it's unset.
--
--    Deleting a business keeps its subscriptions, billing_events and
--    terms_acceptances (section 7 and their on delete set null).
-- ---------------------------------------------------------------------------

create or replace function public.sites_due_for_deletion(p_retention_days integer)
returns table (id uuid, slug text, images jsonb, reason text)
language sql
stable
security definer
set search_path = ''
as $$
  select b.id, b.slug, b.images, 'expired'
    from public.businesses b
   where b.status = 'preview'
     and b.expires_at < now() - interval '30 days'
     and not exists (
       select 1 from public.subscriptions s
        where s.business_id = b.id and s.status in ('active', 'past_due')
     )
  union all
  select b.id, b.slug, b.images, 'canceled'
    from public.businesses b
   where p_retention_days is not null
     and b.status <> 'live'
     and exists (select 1 from public.subscriptions s where s.business_id = b.id)
     and not exists (
       select 1 from public.subscriptions s
        where s.business_id = b.id
          and (s.status <> 'canceled'
               or s.canceled_at is null
               or s.canceled_at > now() - make_interval(days => p_retention_days))
     )
$$;

revoke all on function public.sites_due_for_deletion(integer) from public, anon, authenticated;
grant execute on function public.sites_due_for_deletion(integer) to service_role;

-- Calls the app's cleanup route (POST /api/housekeeping) with the worker
-- secret. The URL is the import worker's URL from Vault with /api/worker
-- swapped for /api/housekeeping, so no extra secret is needed.
create or replace function public.invoke_housekeeping()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
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
    url := regexp_replace(v_url, '/api/worker/?$', '/api/housekeeping'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
end;
$$;

revoke all on function public.invoke_housekeeping() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 10. Nightly housekeeping: drop drafts untouched for 7 days and old
--     rate-limit windows, then ask the app to delete expired previews and
--     cancelled sites past retention (section 9).
-- ---------------------------------------------------------------------------

select cron.schedule(
  'minitebuild-housekeeping',
  '17 3 * * *',
  $$
    delete from public.build_drafts where updated_at < now() - interval '7 days';
    delete from public.rate_limits where window_start < now() - interval '2 days';
    select public.invoke_housekeeping();
  $$
);

-- Minitebuild core schema.
--
-- Access model:
--   * Row-level security is enabled on every table with NO policies, so the
--     anon and authenticated roles can never read or write rows directly.
--   * The admin panel runs on the server with the secret (service_role) key,
--     after the app has verified the signed-in user is ADMIN_EMAIL.
--   * Public pages (previews and live sites) read through get_public_site(),
--     a SECURITY DEFINER function that returns only what a site needs.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- businesses: one row per generated site
-- ---------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'),
  status text not null default 'preview'
    check (status in ('preview', 'live', 'paused')),
  template text not null default 'bold'
    check (template in ('bold', 'classic', 'split')),
  trade text not null default 'general_contractor'
    check (trade in ('general_contractor', 'remodeling')),

  -- Exactly what was typed or imported.
  input_name text not null,
  input_city text not null,
  input_phone text not null,

  -- Details shown on the site. Seeded from Google Places (or the input when
  -- nothing was found); the admin confirms or edits them.
  name text not null check (char_length(name) between 1 and 120),
  city text not null check (char_length(city) between 1 and 80),
  phone text not null check (char_length(phone) between 7 and 30),
  address text,
  hours text[] not null default '{}',
  category text,
  website_url text,
  place_id text,
  places_fetched_at timestamptz,

  -- When the admin last saved the details (confirming the Google data).
  details_confirmed_at timestamptz,
  -- When the business itself confirmed by paying.
  owner_confirmed_at timestamptz,

  -- Site copy (validated by the app's Zod schema) and image overrides
  -- ({ "hero": { "path": "...", "alt": "..." }, ... }).
  content jsonb not null,
  images jsonb not null default '{}'::jsonb,

  tags text[] not null default '{}'
    check (tags <@ array['called', 'texted', 'paid', 'has website', 'unverified']::text[]),
  notes text not null default '',

  published_at timestamptz,
  paused_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_created_at_idx on public.businesses (created_at desc);
create index businesses_status_idx on public.businesses (status);
create index businesses_tags_idx on public.businesses using gin (tags);

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- import_batches / import_jobs: the generation queue
-- ---------------------------------------------------------------------------

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('csv', 'single')),
  filename text,
  total_rows integer not null default 0 check (total_rows >= 0),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index import_batches_created_at_idx on public.import_batches (created_at desc);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches (id) on delete cascade,
  row_number integer not null check (row_number >= 1),
  -- { "name": "...", "city": "...", "phone": "..." } exactly as imported
  input jsonb not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'done', 'failed')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  -- Plain-language reason shown to the admin when a row fails.
  error text,
  business_id uuid references public.businesses (id) on delete set null,
  locked_at timestamptz,
  run_after timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, row_number)
);

create index import_jobs_batch_idx on public.import_jobs (batch_id, row_number);
create index import_jobs_queue_idx on public.import_jobs (run_after, created_at)
  where status = 'queued';
create index import_jobs_running_idx on public.import_jobs (locked_at)
  where status = 'running';

create trigger import_jobs_set_updated_at
  before update on public.import_jobs
  for each row execute function public.set_updated_at();

-- Claim up to p_limit queued jobs for one worker run. Jobs left "running" by a
-- worker that died are put back in the queue (or failed once out of attempts).
-- FOR UPDATE SKIP LOCKED lets several workers (the open import page and the
-- pg_cron call) run at the same time without taking the same row.
create or replace function public.claim_import_jobs(
  p_limit integer default 3,
  p_batch_id uuid default null
)
returns setof public.import_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.import_jobs
     set status = case when attempts >= max_attempts then 'failed' else 'queued' end,
         error = case
           when attempts >= max_attempts
             then coalesce(error, 'Generation timed out several times. Try this row again.')
           else error
         end,
         finished_at = case when attempts >= max_attempts then now() else null end,
         locked_at = null
   where status = 'running'
     and locked_at < now() - interval '10 minutes';

  return query
  update public.import_jobs j
     set status = 'running',
         attempts = j.attempts + 1,
         locked_at = now()
   where j.id in (
     select q.id
       from public.import_jobs q
      where q.status = 'queued'
        and q.run_after <= now()
        and (p_batch_id is null or q.batch_id = p_batch_id)
      order by q.created_at, q.row_number
      limit greatest(p_limit, 0)
      for update skip locked
   )
  returning j.*;
end;
$$;

-- ---------------------------------------------------------------------------
-- subscriptions / billing_events
-- ---------------------------------------------------------------------------

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- 'stub' (dev checkout), 'manual' (admin "mark as paid"), later 'paddle' or
  -- 'lemonsqueezy'.
  provider text not null,
  provider_subscription_id text not null,
  provider_customer_id text,
  plan text not null check (plan in ('monthly', 'annual')),
  status text not null check (status in ('active', 'past_due', 'canceled')),
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index subscriptions_business_idx on public.subscriptions (business_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Every webhook event received. The unique (provider, event_id) key is what
-- makes processing idempotent: a redelivered event is recorded once and its
-- processed_at tells the handler it has already been applied.
create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  type text not null,
  business_id uuid references public.businesses (id) on delete set null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  unique (provider, event_id)
);

create index billing_events_business_idx on public.billing_events (business_id, received_at desc);

-- ---------------------------------------------------------------------------
-- Public read function
-- ---------------------------------------------------------------------------

-- Returns only the fields a preview or live site renders. No notes, tags,
-- input data, Google place_id or billing details.
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
  where b.slug = lower(p_slug);
$$;

-- ---------------------------------------------------------------------------
-- Row-level security and grants
-- ---------------------------------------------------------------------------

alter table public.businesses enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_jobs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

-- No policies are created: with RLS on, anon and authenticated see nothing.
-- Revoke table privileges as well so the Data API refuses outright.
revoke all on table
  public.businesses,
  public.import_batches,
  public.import_jobs,
  public.subscriptions,
  public.billing_events
from anon, authenticated;

revoke all on function public.claim_import_jobs(integer, uuid) from public, anon, authenticated;
grant execute on function public.claim_import_jobs(integer, uuid) to service_role;

revoke all on function public.get_public_site(text) from public;
grant execute on function public.get_public_site(text) to anon, authenticated, service_role;

revoke all on function public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: uploaded site photos
-- ---------------------------------------------------------------------------

-- Public bucket so live sites can show photos by URL. There are no policies on
-- storage.objects for this bucket, so only the service role can upload,
-- replace or delete files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Services the owner listed in the CSV "services" column (empty when none),
-- kept so "Regenerate copy" uses them again.
alter table public.businesses
  add column input_services text[] not null default '{}';

-- Generated services are a guess until the admin edits or confirms them.
alter table public.businesses
  add column services_confirmed_at timestamptz;

# Minitebuild

Minitebuild generates and hosts a one-page website for a local contractor or remodeler from just its **name, city and phone number**. It costs $49/month or $529/year. The product name and both prices live in [`src/config/product.ts`](src/config/product.ts).

How it works:

1. **Lookup.** The business is looked up in Google Places (phone match first, then the top result in the city). Name, address, phone, hours, category and place id are saved. Photos and review text are never requested.
2. **Copy.** Claude writes the copy as JSON in a fixed shape: headline, subheadline, 4–6 services, about, service areas, 4–5 FAQs and a call to action. A Zod schema checks it (length limits, no HTML, no placeholder text). If it fails, Claude gets one more try with the validation errors.
3. **Site.** The site is built from one of three templates (Bold, Classic, Split) and gets a preview at `/p/<slug>`.
4. **Go live.** The owner pays and the site goes live at `<slug>.ROOT_DOMAIN`.

Every business gets a site. If it already has a website it's tagged `has website`; if Google can't find it, it's generated from the input alone and tagged `unverified`.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4) on Vercel
- Supabase: Postgres (data and job queue), Auth (admin login), Storage (uploaded photos), pg_cron + pg_net (background worker)
- Anthropic API for site copy (`claude-opus-5-5` by default)
- Google Places API (New) for business details
- Zod for validation, Vitest for tests

## Environment variables

Copy `.env.example` to `.env.local`.

| Name | Required | What it's for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable key (`sb_publishable_…`). Used for login and public site reads |
| `SUPABASE_SECRET_KEY` | yes | Secret key (`sb_secret_…`). Server only; used by the admin panel after the login check |
| `ADMIN_EMAIL` | yes | The only account allowed into `/admin` |
| `ROOT_DOMAIN` | yes | `minitebuild.com` in production, `localhost:3000` locally |
| `SALES_PHONE` | yes | Shown as "Contact us to activate" on checkout while billing is the stub |
| `WORKER_SECRET` | yes | **Added by me.** Protects `POST /api/worker`; pg_cron sends it as a bearer token. Generate with `openssl rand -hex 32` |
| `APP_ANTHROPIC_API_KEY` | no | Anthropic key for site copy. Read first. Without it (or `ANTHROPIC_API_KEY`), built-in sample copy is used |
| `ANTHROPIC_API_KEY` | no | Fallback when `APP_ANTHROPIC_API_KEY` is not set |
| `ANTHROPIC_MODEL` | no | **Added by me.** Model for site copy; defaults to `claude-opus-5-5` |
| `GOOGLE_PLACES_API_KEY` | no | Without it, fixture businesses are used |

### Running without API keys (fixtures)

If `GOOGLE_PLACES_API_KEY` is missing, lookups use fixtures in `src/lib/places/fixtures.ts`:

- "Elite Remodeling" (Austin) and "JJ General Contractor" (Denver) return full listings. Elite has a website, so it gets the `has website` tag.
- Any name containing **"unlisted"** is never found, so it gets the `unverified` tag.
- Anything else is "found" in the city you typed, with your phone number.

If neither `APP_ANTHROPIC_API_KEY` nor `ANTHROPIC_API_KEY` is set, copy comes from `src/lib/ai/fixture-copy.ts`. It passes the same schema as Claude's output.

## Local setup

You need Node 20.9+ and Docker (for the local Supabase stack).

```bash
npm install
npx supabase start             # local Postgres, Auth, Storage, pg_cron
npx supabase status            # prints the URL, publishable and secret keys
cp .env.example .env.local     # paste those keys; ROOT_DOMAIN=localhost:3000
npx supabase db reset          # applies supabase/migrations
```

Create your admin user (the email in `ADMIN_EMAIL`). Studio is turned off in `supabase/config.toml` to keep the stack light, so use the Auth API:

```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SECRET_KEY" -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"a-long-password","email_confirm":true}'
```

Then start the app:

```bash
npm run dev            # http://localhost:3000
npm test               # unit tests
npm run typecheck
npm run lint
```

Live sites work locally at `http://<slug>.localhost:3000`. Browsers send `*.localhost` to your machine without any hosts-file changes.

To let pg_cron run the worker locally, tell it where the dev server is. From the database container, the host machine is the Docker network gateway (usually `172.18.0.1`; check with `docker network inspect supabase_network_minitebuild`):

```sql
select vault.create_secret('http://172.18.0.1:3000/api/worker', 'import_worker_url');
select vault.create_secret('<your WORKER_SECRET>', 'import_worker_secret');
```

## Supabase setup (hosted)

> **Note:** the Supabase project connected while building this already had tables (`users`, `projects`, `project_segments`), so I didn't touch it. Use a new, empty project for Minitebuild, or tell me which project to use.

1. Create a project at supabase.com.
2. Apply the migrations in `supabase/migrations/`. Either:
   - `npx supabase link --project-ref <ref>` then `npx supabase db push`, or
   - paste each file into the SQL editor, in filename order.

   This creates the five tables with row-level security, the `site-images` storage bucket and the `pg_cron` job.
3. **Auth.** Go to Authentication, then Sign In / Providers, and turn **off** "Allow new users to sign up". Then go to Auth, then Users, then Add user, and create the `ADMIN_EMAIL` account.
4. **Keys.** In Project Settings, then API Keys, copy the URL, the publishable key and a secret key into Vercel.
5. **Worker secrets.** After you deploy, run in the SQL editor:

   ```sql
   select vault.create_secret('https://YOUR_ROOT_DOMAIN/api/worker', 'import_worker_url');
   select vault.create_secret('YOUR_WORKER_SECRET', 'import_worker_secret');
   ```

   The cron job (`minitebuild-import-worker`, every minute) does nothing until both secrets exist. It also only calls the worker when queued rows are waiting.

### How the data is protected

- RLS is on for every table, with **no policies**. Table privileges are also revoked from `anon` and `authenticated`. A signed-in user, or anyone holding the publishable key, gets `permission denied` on every table.
- The admin panel uses the secret key on the server, and only after `requireAdmin()` confirms the session belongs to `ADMIN_EMAIL`. Every server action re-checks this.
- Public pages read through `get_public_site(slug)`. It's a `SECURITY DEFINER` function that returns only what a site renders: no notes, tags, input data, place id or billing.
- `claim_import_jobs` and `invoke_import_worker` can only be run by the service role.
- Storage: the `site-images` bucket is public-read. Only the server, using the secret key, can upload or delete.

## Vercel deploy with a wildcard domain

1. Import the repo in Vercel (framework: Next.js) and add all the environment variables above. Set `ROOT_DOMAIN` to your domain without protocol, e.g. `minitebuild.com`.
2. **Domains.** In Project, then Settings, then Domains, add both `minitebuild.com` and `*.minitebuild.com`.
3. **DNS for wildcards.** Vercel can only issue the wildcard SSL certificate when it hosts your DNS. Point the domain's **nameservers** to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). An A or CNAME record alone isn't enough for `*.`.
4. Deploy, then do step 5 of the Supabase setup (the Vault secrets) with your real domain.
5. Check that it works:
   - `https://minitebuild.com` shows the landing page.
   - `https://minitebuild.com/admin` asks you to log in.
   - A live site loads at `https://<slug>.minitebuild.com`.

Vercel preview deployments (`*.vercel.app`) serve the app itself, not customer sites.

## Testing each feature (what to click)

1. **Login.** Open `/admin`. You're sent to `/login`. Signing in as `ADMIN_EMAIL` lands on Businesses; any other account sees "This account doesn't have access to the admin panel."
2. **Generate one site.** Go to Import, then Add one business. Enter `Elite Remodeling`, `Austin`, `(512) 555-0142` and click Generate site. You land on the business page with the `has website` tag. Try `Unlisted Builders` to see `unverified`. Generate Elite again to get `elite-remodeling-austin-2`.
3. **CSV import.** Go to Import and drag `samples/businesses.csv` onto the drop zone.
   - The column check says 6 businesses are ready and 2 rows can't be used.
   - Click Generate 6 sites and watch the progress bar and per-row list. Rows 7 and 8 fail with their reasons.
   - Close the tab mid-import: pg_cron finishes the batch within about a minute.
4. **Preview.** Open any preview link from the Businesses table, on a phone-sized window. You should see:
   - the sticky banner "This site was built for … Go live for $49/mo"
   - the call bar at the bottom
   - the FAQ opening and closing
5. **Checkout (dev).** In the banner, click Go live. Pick Annual (it shows Save $59) and click Continue to payment, then Pay $529 on the test page. The site is now live: "Open the live website" goes to `http://<slug>.localhost:3000`, and the old preview link redirects there.
6. **Webhook statuses.** Go live again on another site. On the test payment page, click Simulate a failed payment or Simulate a cancellation, and the live address shows "temporarily unavailable".
7. **Admin detail.** On a business page:
   - Edit the headline and click Save (it changes to "Saved"), and the live preview reloads.
   - Switch the template and the preview changes immediately.
   - Try Publish, Pause, Mark as paid and Regenerate copy (each asks for confirmation) and Refresh from Google.
   - Upload a photo, toggle tags and save notes.
8. **SEO.** On a live site, check `/robots.txt`, `/sitemap.xml` and the page source (title, meta description, canonical, `application/ld+json`). An unknown subdomain returns a 404.
9. **Production checkout.** With `npm run build && npm start`, checkout shows "Contact us to activate" with `SALES_PHONE`. Use Mark as paid in the admin.

## Project layout

```
src/
  config/product.ts            product name and prices (the only place)
  proxy.ts                     hostname routing (Next 16 renamed middleware to "proxy")
  app/
    page.tsx                   landing page on ROOT_DOMAIN
    login/                     email + password login
    admin/                     businesses, business detail, import, settings, server actions
    admin-preview/[id]         the admin's live preview (iframe)
    p/[slug]/                  preview + checkout plan picker
    s/[slug]/                  live site, robots.txt, sitemap.xml (reached via <slug>.ROOT_DOMAIN)
    billing/                   stub payment page (dev only) and result page
    api/worker                 queue worker (pg_cron, bearer WORKER_SECRET)
    api/billing/webhook        billing provider webhook
  components/site/             the three templates and shared parts
  lib/
    content/                   Zod schemas, CSV parser, slugs, phone parsing
    places/                    Google Places client, matching, fixtures
    ai/                        Claude call, retry-once logic, fixture copy
    generation/                pipeline + queue worker
    billing/                   provider interface, stub provider, idempotent event handler
    routing/hostname.ts        host -> app | site | 404
    sites/                     public site reads (cached per slug), SEO, JSON-LD
supabase/migrations/           schema, RLS, queue functions, storage bucket, pg_cron job
public/stock/                  stock images per trade
scripts/generate-stock-art.mjs regenerates public/stock
tests/                         Vitest
```

## Notes and decisions

- **Middleware is `src/proxy.ts`.** Next.js 16 renamed `middleware.ts` to `proxy.ts`; it works the same way.
- **Cache Components is off.** With Next 16's Cache Components, a response that has started streaming can't change to a 404 or a redirect. Unknown sites and live previews need real status codes, so public site data is cached per slug instead (`unstable_cache` with tag `site:<slug>`), and every admin edit and billing event invalidates it.
- **No client JS in the templates.** The FAQ is `<details>`/`<summary>` and the call bar is plain CSS, so the templates add no JavaScript. Next.js still ships its small framework runtime. Mobile Lighthouse on the production build scored 92–96 for performance and 100 for accessibility, best practices and SEO, across all three templates.
- **JSON-LD without `dangerouslySetInnerHTML`.** React 19 renders `<script>` text unescaped, so the LocalBusiness JSON is a plain text child with `<` escaped.
- **Stock images are illustrations.** Photo sites were unreachable from the build environment, so `public/stock` holds designed illustrations generated by `scripts/generate-stock-art.mjs`. To use licensed photos, drop JPEGs with the same names (hero 3:2, about 4:3) into `public/stock/<trade>/` and update the alt text in `src/lib/images/stock.ts`.
- **Refusal fallback.** The Claude call uses structured outputs (`output_config.format`) and the server-side refusal fallback (`fallbacks: "default"`) on models that support it.
- **Paused sites** return the "temporarily unavailable" page with `noindex`, and robots.txt disallows everything until the site is live again.
- **Out of scope for now:** self-serve signup, customer editor, blog, booking, contact forms, custom domains UI, other trades, and the real billing provider. A Paddle or Lemon Squeezy provider implements the `BillingProvider` interface in `src/lib/billing/types.ts` and is returned from `src/lib/billing/index.ts`.

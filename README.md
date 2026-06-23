# TokenForge PrintDesk

> **Status: v0.1 Supabase core pass. Not production-hardened yet.**

TokenForge PrintDesk is a static React app for personal 3D print requests, owner review, family/trusted-requester workflows, quote creation, manual payment links, and public gallery management. The frontend is deployable to GitHub Pages. Supabase provides Auth, Postgres, Storage, RLS, and future Edge Function boundaries.

## Tech stack

- Vite + React + TypeScript
- React Router
- Supabase JS client
- Supabase Postgres + RLS + Storage
- Three.js + STLLoader for client-side STL preview
- GitHub Pages static deployment

No Stripe/PayPal API automation, slicing, G-code generation, printer integration, or Raspberry Pi worker is implemented in this pass.

## Local setup

```bash
git clone https://github.com/QuantumPickleJar/tokenforge-printdesk.git
cd tokenforge-printdesk
npm install
cp .env.example .env.local
npm run dev
```

Set:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

`.env.local` must not be committed. The frontend may only use the Supabase anon/publishable key. Service-role keys and provider secrets belong only in Supabase Edge Functions or local secure configuration.

## Supabase setup

1. Link the project:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   ```
2. Push migrations:
   ```bash
   npx supabase db push
   ```
3. Confirm the storage buckets exist:
   - `request-models`: private, app-level STL-only flow, 40 MB limit.
   - `gallery-images`: public for v0.1, images only, 10 MB bucket limit.
4. Configure Auth site URLs / redirect URLs for local dev and GitHub Pages:
   - `http://localhost:5173/tokenforge-printdesk/owner`
   - `https://<your-github-user>.github.io/tokenforge-printdesk/owner`
5. Create the owner in Supabase Auth.
6. Insert an active `owner_members` row linked to that Auth user id. Do not hardcode the owner email in frontend code.

If `supabase` is not a recognized command, use `npx supabase ...` as shown above or install the Supabase CLI through an officially supported method.

If `supabase db push` fails with `relation "supabase_migrations.schema_migrations" does not exist`, do not patch production tables by hand. Verify the project is linked correctly, then repair or initialize migration metadata through the Supabase CLI workflow. Keep schema changes in `supabase/migrations`.

## Request-flow smoke test

After Supabase setup, run the manual smoke test in [`docs/request-flow-smoke-test.md`](docs/request-flow-smoke-test.md). The repository includes a tiny known-good STL at `public/test-assets/smoke-cube.stl` so request submissions can be tested without hunting for a model file.

## Database schema

The migration creates:

- `owner_members`
- `materials`
- `material_colors`
- `gallery_items`
- `gallery_images`
- `family_groups`
- `family_members`
- `print_requests`
- `request_files`
- `quotes`
- `request_events`
- `notification_logs`
- `processing_jobs`
- `submission_events`

PLA and PETG are seeded with editable placeholder density/cost values. Wood PLA is intentionally left out for v0.1.

## Security/RLS notes

RLS is enabled on all app tables in the migration.

Anonymous/public users can:

- read active materials/colors for the request form
- read published gallery items/images
- submit print requests through `submit_print_request`
- upload an STL only to a controlled path under `request-models`
- view/respond to a quote through token-scoped RPC functions

Anonymous/public users should not be able to list requests, read owner notes, list request files, browse private STL storage, modify materials, modify gallery records, manage family members, or directly manage quotes.

Owner/admin users are checked through active `owner_members` rows and can manage dashboard data through RLS-protected tables.

Remaining security work before production:

- server-side CAPTCHA/Turnstile validation
- stronger rate limiting through an Edge Function
- hashed IP logging from the server side
- provider-side email delivery
- full policy review in the hosted Supabase project
- stronger quote-token lifecycle review

## Implemented in this pass

- Audited scaffold package/config/routing/services/pages/docs.
- Corrected known scaffold mismatches:
  - private bucket is `request-models`, not `private-stl`
  - STL upload is `.stl` only
  - public STL limit is 40 MB
  - material model is split into `materials` and `material_colors`
- Public request form creates real request records through Supabase RPC.
- Request STL upload uses private Supabase Storage path `requests/{request_id}/model.stl`.
- STL preview parses and renders selected STL files with Three.js.
- Rough material estimate runs on button press and is labeled non-final.
- Public gallery reads published records from Supabase.
- Owner login uses Supabase magic-link Auth.
- `/owner` is protected by an owner membership guard.
- Owner dashboard reads real requests oldest-first and supports status updates.
- Owner dashboard has basic materials/colors, gallery, family/trusted requester, and quote/payment tabs.
- Family/trusted request classification is handled server-side by active email match and defaults to no payment required.
- Manual quote-link flow is implemented; no automatic payment provider API exists.
- Quote token page can accept/decline through token RPCs.
- Notification rows are logged; real email delivery is stubbed.
- Processing job table exists for future Raspberry Pi / TokenForge worker integration.

## Deferred

- Stripe/PayPal API automation and webhooks
- slicer integration, G-code generation, printer integration
- Raspberry Pi worker implementation
- STL repair or printability guarantees
- real email-provider delivery
- image processing Edge Function
- production-grade abuse prevention
- custom owner settings UI polish

## GitHub Pages deployment

`vite.config.ts` uses:

```ts
base: '/tokenforge-printdesk/'
```

React Router uses the matching basename. Build with:

```bash
npm run build
```

Deploy the generated `dist/` folder to GitHub Pages. A simple `public/404.html` fallback redirects unknown GitHub Pages routes back to the app root; direct deep links may need a richer SPA fallback later if route preservation matters.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

`npm run test` currently runs TypeScript validation only; no unit test runner is configured yet.

# Request Flow Smoke Test

Use this checklist after Supabase migrations and owner setup are complete. It is intended to verify that a public user can submit a print request and that the owner can see and process it.

## Prerequisites

- `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase migrations have been pushed.
- Supabase Auth redirect URLs include local dev and production owner URLs.
- An owner Auth user exists and has an active `owner_members` row.
- The `request-models` bucket exists and is private.
- The `gallery-images` bucket exists and is public.
- At least one active `materials` row and one active `material_colors` row exist.

## Local app start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/tokenforge-printdesk/request
```

## Public requester path

1. Fill out **Name**, **Email**, **Request title**, and **Description**.
2. Choose a material/color if one is available.
3. Upload `public/test-assets/smoke-cube.stl`.
4. Confirm the STL preview renders and the bounds text appears.
5. Check the licensing confirmation box.
6. Submit the request.
7. Confirm the success state shows a request reference ID and says no payment is requested at submission time.

## Supabase verification

In Supabase Table Editor or SQL Editor, verify:

```sql
select id, requester_email, request_title, status, payment_status, payment_required
from public.print_requests
order by received_at desc
limit 5;
```

Expected result:

- the new request exists
- `status = 'submitted'`
- public requester submissions have `payment_required = true`
- public requester submissions have `payment_status = 'not_started'`

Then verify the STL metadata exists:

```sql
select request_id, bucket, storage_path, original_filename, size_bytes, validation_status
from public.request_files
order by uploaded_at desc
limit 5;
```

Expected result:

- `bucket = 'request-models'`
- `storage_path` looks like `requests/<request-id>/model.stl`
- the file is recorded against the submitted request

## Owner path

1. Open `/tokenforge-printdesk/owner/login`.
2. Request a magic link for the owner email.
3. Open the magic link.
4. Confirm `/owner` loads the dashboard instead of redirecting back to login.
5. Confirm the new request appears in the queue.
6. Open the STL download link from the queue.
7. Change the request status to `reviewing` or another owner-managed state.
8. Refresh and confirm the status persisted.

## Family/trusted requester check

1. In the owner dashboard, add a family/trusted member using a unique email.
2. Submit another request using that exact email.
3. Verify the new row has `request_type = 'family_free'`, `payment_required = false`, and `payment_status = 'not_required'`.

## Negative checks

- Submit without an STL: the form should show a validation error.
- Upload a non-STL file: the form should reject it before submission.
- Upload an STL larger than 40 MB: the form should reject it before submission.
- Try opening `/owner` while signed out: it should redirect to `/owner/login`.
- Try owner login with an Auth user that is not active in `owner_members`: it should not load the dashboard.

## Production notes

Before a public launch, add server-side abuse controls. The current v0.1 flow intentionally leaves CAPTCHA/Turnstile validation, stronger rate limiting, and provider email delivery as follow-up work.

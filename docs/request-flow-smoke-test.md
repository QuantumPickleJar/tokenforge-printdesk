# Request Flow Smoke Test

Use this checklist after Supabase migrations and owner setup are complete. It is intended to verify that a public user can submit a print request and that the owner can see and process it.

## Prerequisites

- `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase migrations have been pushed.
- Supabase Auth redirect URLs include local dev and production owner URLs.
- An owner Auth user exists and has an active `owner_members` row.
- The `request-models` bucket exists and is private.
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

## Public requester path: model URL

1. Fill out **Name**, **Email**, **Request title**, and **Description**.
2. In **Model Source**, leave **Paste a model URL** selected.
3. Paste a valid public model URL, such as a Printables, Thingiverse, MakerWorld, GitHub, or direct download page.
4. Confirm the STL upload control and preview are hidden.
5. Choose a material/color if one is available.
6. Check the licensing confirmation box.
7. Submit the request.
8. Confirm the success state shows a request reference ID and says no payment is requested at submission time.

## Public requester path: STL upload

1. Fill out **Name**, **Email**, **Request title**, and **Description**.
2. In **Model Source**, switch to **Upload an STL file**.
3. Confirm the model URL field is hidden.
4. Upload `public/test-assets/smoke-cube.stl`.
5. Confirm the STL preview renders and the bounds text appears.
6. Choose a material/color if one is available.
7. Optionally run **Estimate material cost**.
8. Check the licensing confirmation box.
9. Submit the request.
10. Confirm the success state shows a request reference ID and says no payment is requested at submission time.

## Supabase verification

In Supabase Table Editor or SQL Editor, verify:

```sql
select id, requester_email, request_title, model_source_url, status, payment_status, payment_required
from public.print_requests
order by received_at desc
limit 5;
```

Expected result:

- the new request exists
- `status = 'submitted'`
- public requester submissions have `payment_required = true`
- public requester submissions have `payment_status = 'not_started'`
- link-based requests have `model_source_url` populated
- upload-based requests have `model_source_url` empty/null

Then verify STL metadata for upload-based requests:

```sql
select request_id, bucket, storage_path, original_filename, size_bytes, validation_status
from public.request_files
order by uploaded_at desc
limit 5;
```

Expected result for upload-based requests:

- `bucket = 'request-models'`
- `storage_path` looks like `requests/<request-id>/model.stl`
- the file is recorded against the submitted request

Expected result for link-based requests:

- no `request_files` row is required
- the owner queue should show an **Open link** action instead of **Open STL**

## Owner path

1. Open `/tokenforge-printdesk/owner/login`.
2. Request a magic link for the owner email.
3. Open the magic link.
4. Confirm `/owner` loads the dashboard instead of redirecting back to login.
5. Confirm the new request appears in the queue.
6. For an uploaded request, open the **Open STL** action from the queue.
7. For a linked request, open the **Open link** action from the queue.
8. Change the request status to `reviewing` or another owner-managed state.
9. Refresh and confirm the status persisted.
10. Open the **Portfolio Gallery** tab and confirm it links to the Personal-Static portfolio instead of duplicating gallery management here.

## Family/trusted requester check

1. In the owner dashboard, add a family/trusted member using a unique email.
2. Submit another request using that exact email.
3. Verify the new row has `request_type = 'family_free'`, `payment_required = false`, and `payment_status = 'not_required'`.

## Negative checks

- Select **Paste a model URL** and submit without a URL: the form should show a validation error.
- Select **Paste a model URL** and enter a non-URL value: the form should show a validation error.
- Select **Upload an STL file** and submit without an STL: the form should show a validation error.
- Upload a non-STL file: the form should reject it before submission.
- Upload an STL larger than 40 MB: the form should reject it before submission.
- Switch from upload mode to link mode: the STL preview/upload state should clear.
- Switch from link mode to upload mode: the URL field should clear and hide.
- Try opening `/owner` while signed out: it should redirect to `/owner/login`.
- Try owner login with an Auth user that is not active in `owner_members`: it should not load the dashboard.

## Production notes

Before a public launch, add server-side abuse controls. The current v0.1 flow intentionally leaves CAPTCHA/Turnstile validation, stronger rate limiting, and provider email delivery as follow-up work.

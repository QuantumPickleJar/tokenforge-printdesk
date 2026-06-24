# Raspberry Pi local dry-run runbook

Use this when the app is cloned on a Raspberry Pi and you want to reach it from another machine, finish configuration, and dry-run the Tokenforge Generator → Printdesk intake.

## 1. Get back into the Pi

From a machine that is on the same Tailscale tailnet:

```bash
tailscale status
tailscale ip
ssh <pi-user>@<pi-tailscale-ip-or-magicdns-name>
```

If the Pi does not show up in `tailscale status`, authenticate Tailscale on the Pi:

```bash
sudo tailscale up
```

If you want Tailscale-managed SSH instead of normal SSH keys, enable it on the Pi:

```bash
sudo tailscale up --ssh
# or, if Tailscale is already up:
tailscale set --ssh
```

## 2. Update the cloned repo

```bash
cd ~/tokenforge-printdesk
git status
git pull --ff-only
```

If `git pull --ff-only` refuses because local files changed, stop and inspect the diff before overwriting anything:

```bash
git status
git diff
```

## 3. Configure environment variables

Create a local env file if it does not exist:

```bash
cp .env.example .env.local
nano .env.local
```

At minimum, set:

```bash
VITE_SUPABASE_URL=<your Supabase project URL>
VITE_SUPABASE_ANON_KEY=<your Supabase anon key>
```

Do not put the Supabase service role key in `.env.local` for this frontend app.

## 4. Install and verify

```bash
npm ci
npm run build
npm run lint
npm run test
```

The app scripts are:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## 5. Start the app locally on the Pi

For a development server:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the app on the Pi at:

```text
http://127.0.0.1:5173/tokenforge-printdesk/
```

For a production-like preview:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open:

```text
http://127.0.0.1:4173/tokenforge-printdesk/
```

## 6. Share it over Tailscale Serve

With the dev server running on port 5173:

```bash
tailscale serve 5173
```

With the preview server running on port 4173:

```bash
tailscale serve 4173
```

Tailscale will print a tailnet HTTPS URL. Use that URL from your other machine, then include the Vite basename path:

```text
https://<pi-name>.<tailnet>.ts.net/tokenforge-printdesk/
```

Keep the Vite server listening on localhost unless you intentionally want LAN access. Tailscale Serve can proxy localhost to your tailnet without exposing the app to the public internet.

## 7. Where owner login is

There are now two visible owner entry points:

1. Top navigation: **Owner Login**
2. Home page owner-tools callout: **Owner Login** and **Generator Intake**

Routes:

```text
/tokenforge-printdesk/owner/login
/tokenforge-printdesk/owner
/tokenforge-printdesk/owner/intake
```

The `Generator Intake` page is protected by owner auth. If you are not logged in, use `Owner Login` first.

## 8. Owner bootstrap checklist

Before owner login works, Supabase must have an owner member row for your email in `owner_members`.

Use the Supabase SQL editor with your real owner email:

```sql
insert into public.owner_members (email, display_name, role, is_active)
values ('you@example.com', 'Vincent', 'admin', true)
on conflict (email) do update set
  display_name = excluded.display_name,
  role = excluded.role,
  is_active = excluded.is_active;
```

Then use the app's owner login magic-link flow.

## 9. Dry-run Tokenforge Generator intake

After login:

1. Open `/tokenforge-printdesk/owner/intake`.
2. Leave the sample JSON in place for the first smoke test.
3. Click **Validate**.
4. Confirm the preview shows item, requester, material, quantity, pricing mode, model source, and notes.
5. Click **Add to queue**.
6. Return to `/tokenforge-printdesk/owner`.
7. Confirm the imported request appears in the owner queue.
8. Open the model link from the queue if the payload supplied an HTTP/HTTPS model URL.
9. Move the request through `reviewing` → `accepted_for_quote` → quote workflow as usual.

## 10. Tie-back to the previous implementation

The previous implementation added the owner-only Tokenforge JSON intake. This runbook ties that work back to the local Pi dry run:

- Pull latest `main` on the Pi.
- Configure `.env.local` with Supabase frontend values.
- Run build/lint/type-check.
- Start Vite locally.
- Reach it through Tailscale Serve.
- Use owner login.
- Submit the sample Generator Intake payload.
- Verify the request appears in the admin queue.

## 11. Quick recovery commands

Check current branch and commit:

```bash
git branch --show-current
git log -1 --oneline
```

Check whether the dev server is running:

```bash
ps aux | grep vite
```

Check listening ports:

```bash
ss -ltnp | grep -E '5173|4173'
```

Stop Tailscale Serve:

```bash
tailscale serve reset
```

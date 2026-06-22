# TokenForge PrintDesk

> **Status: v0.1 Scaffold — Not production-ready.**
> This is a structural scaffold. Core UI, routing, types, and service stubs
> are in place. Supabase integration, real file upload, and production auth
> are intentionally deferred to the next implementation pass.

A request-and-quote system for 3D printing. Requesters submit print jobs,
the owner reviews them and generates quotes, and payment/pickup is coordinated
via owner-provided links. No automatic payment processing. No auto-approval.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Local setup](#local-setup)
3. [Environment variables](#environment-variables)
4. [Supabase setup (placeholder)](#supabase-setup-placeholder)
5. [GitHub Pages deployment](#github-pages-deployment)
6. [What is implemented](#what-is-implemented)
7. [What is intentionally deferred](#what-is-intentionally-deferred)
8. [Folder structure](#folder-structure)
9. [Routes](#routes)
10. [Next implementation pass checklist](#next-implementation-pass-checklist)

---

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Vite](https://vite.dev) | ^8 | Build tool / dev server |
| [React](https://react.dev) | ^19 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | ~6 | Type safety |
| [React Router](https://reactrouter.com) | ^7 | Client-side routing |
| [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) | ^2 | DB / Auth / Storage client |
| [Three.js](https://threejs.org) | ^0.184 | STL preview (prepared, not wired) |
| Plain CSS | — | Styling (no heavy UI framework) |

---

## Local setup

**Prerequisites:** Node.js ≥ 20, npm ≥ 10.

```bash
# 1. Clone
git clone https://github.com/QuantumPickleJar/tokenforge-printdesk.git
cd tokenforge-printdesk

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start dev server
npm run dev
```

The app starts at `http://localhost:5173/tokenforge-printdesk/`.

If Supabase env vars are missing, the app shows a development warning in the
console and falls back to mock data — it does not crash.

---

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes (production) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (production) | Supabase anonymous/public key |

**Never commit `.env` to version control.** The `.gitignore` excludes it.
Only the anonymous/public key belongs on the frontend — never the service-role key.

---

## Supabase setup (placeholder)

> Full Supabase configuration is deferred to the implementation pass.

When implementing:

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Enable **Row Level Security (RLS)** on all tables before going live.
3. Create tables: `requests`, `quotes`, `materials`, `gallery`, `family_groups`,
   `family_members`, `processing_jobs`.
4. Create a **private** Storage bucket for STL files (`private-stl`).
5. Create a **public** Storage bucket for gallery images (`gallery-images`).
6. Configure Auth for owner magic-link login.
7. Add RLS policies: only the owner can read all rows; requesters access only
   their own data via token-scoped policies.

---

## GitHub Pages deployment

The Vite config sets `base: '/tokenforge-printdesk/'` for GitHub Pages
compatibility. React Router uses the same `basename`.

```bash
# Build for production
npm run build

# Output is in dist/ — deploy that directory to GitHub Pages
```

To deploy via GitHub Actions, push to the default branch and configure
the Pages source to use the `gh-pages` branch or the `dist/` folder via
an Actions workflow.

> If you add a custom domain, set `base: '/'` in `vite.config.ts` and
> update the `BrowserRouter` `basename` in `src/app/App.tsx`.

**Note:** GitHub Pages serves static files. All routes fall through to
`index.html` via a `404.html` redirect trick or a custom domain with
proper SPA fallback. A `404.html` identical to `index.html` may be needed
for direct URL access to sub-routes.

---

## What is implemented

- ✅ Vite + React + TypeScript project scaffold
- ✅ React Router with all planned routes
- ✅ Responsive app shell (header/nav, main, footer)
- ✅ Home page with hero, how-it-works, feature list
- ✅ Gallery page with mock data and card grid
- ✅ Request form (placeholder) with all fields:
  - Name, email, title, description, source link
  - Material selection (mock materials)
  - Color preference
  - STL file input (validated, not uploaded)
  - Licensing / personal design checkboxes
  - Reply requested checkbox
  - Shipping toggle
  - Advanced mode toggle (layer height, infill type/%, wall count)
  - Accessible help popovers for all advanced settings
  - "Estimate material cost" button (returns clearly mocked rough estimate)
- ✅ Quote page (`/quote/:token`) with mock quote display and accept/decline scaffold
- ✅ Owner login page with mock magic-link UI
- ✅ Owner dashboard with:
  - Queue tab with mock data table (oldest-first)
  - Bulk action controls (disabled/scaffold)
  - Family/Trusted tab with mock groups
  - Placeholder tabs: Requests, Materials, Gallery, Quotes/Payments, Settings
- ✅ STL preview placeholder component (`src/components/stl/StlPreview.tsx`)
- ✅ Supabase client with env-var guards (graceful warning if unconfigured)
- ✅ All TypeScript types: `printRequest`, `materials`, `gallery`, `quotes`, `family`, `processing`
- ✅ All service stubs with TODO comments: `requestService`, `materialService`, `galleryService`, `quoteService`, `storageService`, `stlAnalyzer`, `estimateService`, `paymentService`, `notificationService`, `processingJobService`
- ✅ `.env.example` with required variables
- ✅ GitHub Pages `base` configured in `vite.config.ts`
- ✅ Responsive CSS with custom properties, no heavy UI framework
- ✅ Accessible focus states, ARIA labels, semantic HTML
- ✅ No secrets committed
- ✅ No real payment processing
- ✅ No real file upload
- ✅ No production auth claims

---

## What is intentionally deferred

| Feature | Why deferred |
|---------|-------------|
| Supabase DB queries | Requires schema + RLS design review |
| Real STL upload | Requires security review (file validation, private bucket config) |
| Owner auth (Supabase Auth) | Requires session management, RLS, and rate-limiting |
| Email notifications | Requires Edge Function + email provider setup |
| Real material estimates | Requires processing worker (Pi/slicer) integration |
| Payment provider API | No automatic payment in v0.1; manual links only |
| Raspberry Pi processing worker | Separate system — not a frontend concern |
| Gallery image upload | Requires public bucket config and CDN review |
| Production 404 SPA fallback | Requires GitHub Pages `404.html` setup |
| Quote token security | Server-side validation required; do not trust client token |

---

## Folder structure

```
src/
  app/
    App.tsx          — Root app component with BrowserRouter
    routes.tsx       — All route definitions
  components/
    common/
      HelpPopover.tsx     — Accessible help tooltip/popover
      StatusBadge.tsx     — Request/payment status badges
    layout/
      AppShell.tsx    — Page shell wrapper
      AppNav.tsx      — Sticky header/nav
      AppFooter.tsx   — Footer
    stl/
      StlPreview.tsx  — STL preview placeholder (Three.js deferred)
    forms/            — (reserved for extracted form components)
    gallery/          — (reserved for gallery sub-components)
    owner/            — (reserved for dashboard sub-components)
    settings-help/    — (reserved for settings/help components)
  pages/
    HomePage.tsx
    GalleryPage.tsx
    RequestPage.tsx
    QuotePage.tsx
    OwnerLoginPage.tsx
    OwnerDashboardPage.tsx
    NotFoundPage.tsx
  services/
    supabaseClient.ts     — Supabase client with env-var guard
    requestService.ts     — Submit/fetch print requests (stub)
    materialService.ts    — Fetch materials (stub)
    galleryService.ts     — Fetch gallery entries (stub)
    quoteService.ts       — Quote by token (stub)
    storageService.ts     — STL private storage (stub)
    stlAnalyzer.ts        — STL file validation + analysis (stub)
    estimateService.ts    — Rough material cost estimate (mock)
    paymentService.ts     — Payment actions (stub)
    notificationService.ts— Email notifications (stub)
    processingJobService.ts— Processing job CRUD (stub)
  types/
    printRequest.ts   — RequestStatus, PaymentStatus, RequestType, PrintRequest
    materials.ts      — Material type + mock data
    gallery.ts        — GalleryEntry type + mock data
    quotes.ts         — Quote type + mock quote
    family.ts         — FamilyGroup, FamilyMember types + mock data
    processing.ts     — ProcessingJob, ProcessingJobStatus types
  utils/              — (reserved for utility functions)
  styles/
    global.css        — Global CSS custom properties, reusable utility classes
```

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `HomePage` | Landing page |
| `/gallery` | `GalleryPage` | Mock gallery |
| `/request` | `RequestPage` | Quote request form (scaffold) |
| `/quote/:token` | `QuotePage` | Quote view by token (mock) |
| `/owner/login` | `OwnerLoginPage` | Mock magic-link login |
| `/owner` | `OwnerDashboardPage` | Mock dashboard — **must be auth-protected** |
| `*` | `NotFoundPage` | 404 fallback |

---

## Next implementation pass checklist

### Authentication
- [ ] Implement Supabase Auth magic-link for owner login
- [ ] Add auth guard component for `/owner` route
- [ ] Verify owner email server-side before granting dashboard access
- [ ] Add session refresh / logout

### Database
- [ ] Design and create Supabase schema (requests, quotes, materials, gallery, family_groups, family_members, processing_jobs)
- [ ] Enable RLS on all tables with appropriate policies
- [ ] Replace all mock data with real Supabase queries in service files
- [ ] Add Supabase Edge Functions for server-side actions (notifications, token validation)

### File upload
- [ ] Create private `stl` Supabase Storage bucket
- [ ] Implement `storageService.uploadStlFile()` with type/size validation
- [ ] Implement `storageService.getSignedStlUrl()` for owner review
- [ ] Wire Three.js STLLoader in `StlPreview.tsx` for client-side preview

### Request form
- [ ] Connect form submission to real Supabase insert
- [ ] Add server-side input validation / rate limiting
- [ ] Trigger email notification on submission

### Quote workflow
- [ ] Generate secure random quote tokens (server-side)
- [ ] Send quote token to requester via email
- [ ] Validate quote token server-side on `/quote/:token` load
- [ ] Implement accept/decline with Supabase update

### Payment
- [ ] Owner pastes payment URL into dashboard (v0.1 manual flow)
- [ ] Validate payment URL domain on server before sending to requester
- [ ] (Future) Integrate Stripe or PayPal invoice API via Edge Function

### Processing worker
- [ ] Design Supabase job queue schema
- [ ] Implement Raspberry Pi worker to poll and claim jobs
- [ ] Worker writes slicer results back to Supabase
- [ ] Frontend reads completed job metadata for display

### GitHub Pages
- [ ] Add `404.html` (copy of `index.html`) for SPA route fallback
- [ ] Set up GitHub Actions workflow for automated deployment
- [ ] Verify all routes work after deployment

### Security review
- [ ] Audit all RLS policies
- [ ] Review all TODO security comments in service files
- [ ] Penetration test quote token endpoint
- [ ] Validate file uploads server-side before processing

# JanusScope

JanusScope is an AI construction help platform for scope, contracts, bids, RFIs, change orders, budgets, project communication, and practical risk review. The current MVP keeps the proven SubScope package review engine, then adds the broader JanusScope workbench with guided workflows, Ask Janus, a prompt library, templates, projects, reports, consulting request, and settings surfaces. It uses Next.js App Router, TypeScript, Tailwind CSS, Zod validation, email/password authentication, Supabase-backed project storage, server-side project access checks, Playwright PDF generation, and CSV issue-log export.

## What Was Built

- Public JanusScope landing page at `/`
- Security and data handling page at `/security`
- Auth routes at `/auth/login`, `/auth/signup`, and `/auth/logout`
- Route aliases for `/login`, `/dashboard`, `/ask`, `/workflows`, `/prompts`, `/templates`, `/projects`, `/reports`, `/consulting`, and `/settings`
- Temporary demo access from login/signup for product-flow testing
- Protected app routes under `/app`
- Dashboard at `/app/dashboard` with job-to-be-done workflow cards
- Ask Janus workbench at `/app/ask`
- Workflow list and detail pages at `/app/workflows` and `/app/workflows/[workflowSlug]`
- Prompt library at `/app/prompts`
- Template library at `/app/templates`
- Project list and project detail hub at `/app/projects` and `/app/projects/[projectId]`
- Reports and export index at `/app/reports`
- Consulting request draft form at `/app/consulting`
- Settings and beta data-handling notes at `/app/settings`
- New project flow at `/app/projects/new`
- Single package upload/classification/delete page at `/app/projects/[projectId]/upload`
- Review Package page at `/app/projects/[projectId]/questions` with classified files, trade detection, review focus, and automatic report forwarding
- Compatibility redirect at `/app/projects/[projectId]/processing`
- Prioritized web report and download center at `/app/projects/[projectId]/report`
- PDF download route using Playwright
- CSV issue log download route
- Delete generated reports and delete full project actions
- Signed email/password sessions and per-user/per-organization local persistence fallback
- Supabase schema in `supabase/schema.sql`
- Structured analysis JSON validation in `lib/analysis-schema.ts`
- Document classifier in `lib/document-classifier.ts`
- Trade detector and lightweight trade modules in `lib/trade-detector.ts` and `lib/trade-review.ts`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in production values:

```bash
cp .env.example .env.local
```

Required for production:

- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_UPLOAD_BUCKET`

When Supabase variables are missing locally, the app uses `.data/subscope-db.json` and `.data/uploads` so the product flow can be tested without cloud credentials. On Vercel without Supabase, the app uses Vercel Runtime Cache as a temporary shared fallback so the flow does not crash across functions. Production should use Supabase for durable project and document records.

## Run Locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. It defaults to `http://localhost:3000` when available.

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a private storage bucket for uploaded documents and reports.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
5. Use signed URLs for temporary downloads in production.

The current local MVP uses `.data/subscope-db.json` and `.data/uploads` as a durable dev fallback so the app works without Supabase credentials. On Vercel, Runtime Cache keeps the flow stable while Supabase is missing, but it is not a database and can evict data.

## Authentication Setup

1. Set `SESSION_SECRET` to a long random value in `.env.local` and Vercel.
2. Run the Supabase schema so `users.password_hash` exists.
3. Users sign up or log in at `/auth/signup` and `/auth/login`.
4. Logged-out users are redirected to login before dashboard, project, upload, or report routes.
5. Use `Continue in Demo Mode` on the auth pages for temporary QA access while the product flow is being stabilized.

## Deploy To Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Run the Supabase schema and configure storage.
6. Deploy.

For Playwright PDF generation on serverless, keep the `playwright` dependency installed and verify Chromium availability in the target Vercel runtime. If needed, move PDF generation to a background worker or a dedicated Node service.

## Known Limitations

- Local fallback storage or Vercel Runtime Cache is used unless Supabase persistence is configured with the included schema.
- Uploaded binary files are stored locally in dev; production should use Supabase Storage private buckets.
- PDF/DOCX/XLSX/OCR extraction is scaffolded but not fully implemented.
- Trade-specific modules currently cover electrical and windows. Other trades route through the general review until their modules are added.
- The analysis engine is deterministic and validates structured JSON; an LLM provider can replace or augment it later.
- Local AHJ requirements are phrased as verification prompts, not verified legal claims.
- Access control is enforced by signed sessions and ownership checks in local mode; Supabase RLS policies are provided for production.

## Recommended Next Improvements

- Add background job processing for document parsing, OCR, AI review retries, and report generation.
- Add password reset and email verification.
- Add organization invitation and role management.
- Add signed Supabase download URLs for document/report files.
- Add end-to-end Playwright tests for a second user access-denial scenario.

JanusScope is not a replacement for an attorney, estimator, project manager, superintendent, or professional judgment. It helps construction teams ask better questions, organize risk, preserve assumptions, and create cleaner project communication before issues get expensive.

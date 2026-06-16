# SubScope Risk Review

SubScope Risk Review is a production-ready MVP for subcontractors who need to compare a GC subcontract against what they actually priced before signing. It uses Next.js App Router, TypeScript, Tailwind CSS, Zod validation, Auth0-compatible Universal Login routes, Supabase schema/client scaffolding, server-side project access checks, Playwright PDF generation, and CSV issue-log export.

## What Was Built

- Public landing page at `/` with plain contractor-focused copy and sample report CTA
- Security and data handling page at `/security`
- Auth routes at `/auth/login`, `/auth/callback`, and `/auth/logout`
- Protected app routes under `/app`
- Dashboard at `/app/dashboard`
- New project flow at `/app/projects/new`
- Document upload/classification/delete page at `/app/projects/[projectId]/upload`
- Intake checklist at `/app/projects/[projectId]/questions`
- Processing page at `/app/projects/[projectId]/processing`
- Web report and download center at `/app/projects/[projectId]/report`
- PDF download route using Playwright
- CSV issue log download route
- Delete generated reports and delete full project actions
- Signed local dev sessions and per-user/per-organization local persistence fallback
- Supabase schema in `supabase/schema.sql`
- Structured analysis JSON validation in `lib/analysis-schema.ts`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in production values:

```bash
cp .env.example .env.local
```

Required for production:

- `NEXT_PUBLIC_APP_URL`
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LLM_API_KEY` or `OPENAI_API_KEY`
- `FILE_RETENTION_DAYS`

When Auth0 variables are missing locally, `/auth/login` creates a signed demo session so the product flow can be tested without cloud credentials.

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

The current local MVP uses `.data/subscope-db.json` and `.data/uploads` as a durable dev fallback so the app works without Supabase credentials. The schema and admin client are included for production wiring.

## Auth0 Setup

1. Create an Auth0 Regular Web Application.
2. Add callback URL: `https://your-domain.com/auth/callback`
3. Add logout URL: `https://your-domain.com`
4. Enable Universal Login.
5. Configure MFA in Auth0 tenant settings.
6. Step-up MFA hooks are linked before upload, report viewing, downloads, and destructive actions using `/auth/login?mfa=1&returnTo=...`.

## Deploy To Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from `.env.example`.
4. Set `AUTH0_BASE_URL` and `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Add the Vercel callback/logout URLs in Auth0.
6. Run the Supabase schema and configure storage.
7. Deploy.

For Playwright PDF generation on serverless, keep the `playwright` dependency installed and verify Chromium availability in the target Vercel runtime. If needed, move PDF generation to a background worker or a dedicated Node service.

## Known Limitations

- Local fallback storage is used unless Supabase persistence is wired to the included schema.
- Uploaded binary files are stored locally in dev; production should use Supabase Storage private buckets.
- PDF/DOCX/XLSX/OCR extraction is scaffolded but not fully implemented.
- The analysis engine is deterministic and validates structured JSON; an LLM provider can replace or augment it later.
- Local AHJ requirements are phrased as verification prompts, not verified legal claims.
- Access control is enforced by signed sessions and ownership checks in local mode; Supabase RLS policies are provided for production.

## Recommended Next Improvements

- Implement Supabase-backed repository methods for all project/document/review operations.
- Add background job processing for document parsing, OCR, AI review retries, and report generation.
- Add Auth0 SDK session validation or JWT verification against Auth0 JWKS.
- Add organization invitation and role management.
- Add signed Supabase download URLs for document/report files.
- Add end-to-end Playwright tests for a second user access-denial scenario.

SubScope is not a replacement for an attorney. It helps subcontractors identify issues, ask better questions, preserve exclusions, and avoid signing a subcontract that does not match what they priced.

# JanusScope

JanusScope is an AI construction education and software platform that helps construction professionals learn, review, organize, and work through project documents, scopes, risks, bid questions, and construction workflows. The current MVP keeps the proven SubScope package review engine, then adds the broader JanusScope workbench with guided workflows, Ask Janus, a prompt library, templates, projects, reports, consulting request, and settings surfaces. It uses Next.js App Router, TypeScript, Tailwind CSS, Zod validation, email/password authentication, Supabase-backed project storage, server-side project access checks, Playwright PDF generation, and CSV issue-log export.

## Positioning And Terminology

Use clear, practical construction language. JanusScope is a construction education and workflow software platform powered by AI. It helps owners, developers, general contractors, subcontractors, estimators, project managers, superintendents, and consultants review documents, understand scope, organize project risk, and ask better questions.

JanusScope is not a data brokerage, public pricing source, estimating replacement, legal review tool, code compliance engine, or replacement for experienced construction professionals.

Terminology map:

| Avoid | Use instead |
| --- | --- |
| Bid intelligence platform | Construction education and software platform |
| Construction data analytics | Construction document review, education, and workflow tools |
| Predictive construction intelligence | AI-guided construction review and planning support |
| Pricing intelligence | Budget review, scope comparison, and estimating support |
| Automated bid analytics | AI-assisted bid review and scope leveling |
| Construction intelligence platform | Construction education and workflow software platform |

Preferred product description:

> JanusScope is an AI construction education and software platform that helps construction professionals review project documents, understand scope, identify risk, and ask better questions before work begins.

## What Was Built

- Public JanusScope landing page at `/`
- Security and data handling page at `/security`
- Auth routes at `/auth/login`, `/auth/signup`, and `/auth/logout`
- Route aliases for `/login`, `/dashboard`, `/ask`, `/workflows`, `/prompts`, `/templates`, `/projects`, `/reports`, `/consulting`, and `/settings`
- Environment-gated demo access from login/signup for product-flow testing
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
- Runtime sensitive-data scanner for local uploads, exports, reports, and `.data/subscope-db.json`

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

When Supabase variables are missing locally, the app uses `.data/subscope-db.json` and `.data/uploads` so the product flow can be tested without cloud credentials. Keep that local runtime store sanitized or reset before sharing the workspace. In production on Vercel, JanusScope now fails closed unless Supabase is configured or `ALLOW_RUNTIME_CACHE_STORE_FALLBACK=true` is explicitly set for temporary QA.

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
npm run check-sensitive-content
npm run check-runtime-sensitive-data
npm run typecheck
npm run lint
npm test
npm run build
```

## Content Safety And Sample Data Rules

JanusScope must not ship with any proprietary, confidential, employer-derived, client-derived, or project-specific data. All examples must be synthetic. Do not use real project names, addresses, companies, people, bid numbers, budgets, scope language, file names, contract terms, screenshots, templates, seed records, or uploaded documents from any employer or client.

The product rule is:

`USE_FAKE_SAMPLE_DATA_ONLY = true`

When this is enabled:

- Only synthetic sample data may appear in the product
- Demo projects must be synthetic
- Template examples must be synthetic
- Placeholder names must be synthetic
- Seed files must be synthetic
- Screenshots must be synthetic
- Onboarding examples must be synthetic

All demo identities, addresses, pricing examples, and placeholder contacts should come from `lib/synthetic-data.ts`. Approved demo-data files are tracked in `scripts/synthetic-data-approvals.json`.

Acceptable sample scope language:

> Replace existing unit electrical panels where noted. Include labor, material, permit coordination, patching directly related to panel replacement, and cleanup. Excludes utility company fees unless specifically stated.

Developer rule:

When creating default examples, prompts, templates, workflows, placeholder documents, seed database content, demos, or screenshots, generate synthetic data from scratch. Do not use names, details, addresses, file structures, contract terms, project titles, pricing, or wording from real employers, real clients, real projects, or user conversations.

Product principle:

JanusScope should not pretend to be smarter than experienced construction professionals. It should help preserve, organize, and scale the kind of judgment experienced construction people use when reviewing scope, contracts, budgets, field issues, and project risk.

User-facing trust note:

JanusScope examples use synthetic project names, companies, addresses, people, and sample data. Users are responsible for ensuring they have authorization to upload and review any project documents they use inside the platform.

## Sensitive Content Check

Run this before committing or deploying:

```bash
npm run privacy:audit
```

The source scanner reads banned terms from `scripts/sensitive-keywords.txt`. Add employer, client, project, address, file-name, and sensitive internal keywords there as needed. It scans source code, seed/sample data, markdown files, text public assets, and file paths. It fails with the file and line number for any match.

The runtime scanner checks `.data/subscope-db.json`, `.data/uploads`, `uploads`, `storage`, `documents`, `exports`, and `reports`. This catches local QA uploads, generated reports, exported CSVs, and runtime database rows before demoing or building.

The scanner also checks for unapproved:

- company-like names
- postal-address patterns
- email addresses
- phone numbers
- hardcoded dollar amounts

Generic synthetic demo data is allowed only in files approved by `scripts/synthetic-data-approvals.json`.

The scanner intentionally ignores its own keyword list and this README validation block so the required policy checklist can mention banned terms without making the repo permanently fail.

## Sample Data Validation Checklist

Before release, confirm:

<!-- sensitive-content-check: allow-start -->
- No ICON National references
- No ICON Builders references
- No Wilshire Pacific Builders references
- No banned client references
- No Belton Woods references
<!-- sensitive-content-check: allow-end -->
- No real project names
- No real addresses
- No real employees
- No real subcontractors
- No real owners, developers, architects, or consultants
- No real phone numbers
- No real emails
- No real budget data
- No real subcontractor pricing
- No copied contract language
- No copied proposal language
- No copied scope sheets
- No copied bid tabs
- No copied internal file names
- No uploaded documents included in the public repo
- No sensitive data in commits
- No sensitive data in screenshots
- No sensitive data in seed files
- No sensitive data in demo accounts

## Before Deploying JanusScope

1. Run the sensitive content check.
2. Run the runtime sensitive-data check.
3. Review seed data manually.
4. Review public screenshots manually.
5. Review sample templates manually.
6. Confirm no proprietary or employer-derived material is included.
7. Confirm all sample data is synthetic.
8. Confirm uploaded user files are not committed to the repository.
9. Confirm environment variables are not committed.
10. Confirm storage and retention behavior is documented.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a private storage bucket for uploaded documents and reports.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
5. Use signed URLs for temporary downloads in production.

The current local MVP uses `.data/subscope-db.json` and `.data/uploads` as a durable dev fallback so the app works without Supabase credentials. Production should use Supabase. Vercel Runtime Cache can be enabled only as an explicit temporary QA fallback with `ALLOW_RUNTIME_CACHE_STORE_FALLBACK=true`; it is not a database and can evict data.

## Authentication Setup

1. Set `SESSION_SECRET` to a long random value in `.env.local` and Vercel.
2. Run the Supabase schema so `users.password_hash` exists.
3. Users sign up or log in at `/auth/signup` and `/auth/login`.
4. Logged-out users are redirected to login before dashboard, project, upload, or report routes.
5. Use `ENABLE_DEMO_ACCESS=true` only when temporary QA demo access should appear on auth pages. Demo access is hidden by default in production.

## Deploy To Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Run the Supabase schema and configure storage.
6. Deploy.

For Playwright PDF generation on serverless, keep the `playwright` dependency installed and verify Chromium availability in the target Vercel runtime. If needed, move PDF generation to a background worker or a dedicated Node service.

## Known Limitations

- Local fallback storage is for development only. Production should use Supabase persistence with the included schema.
- Uploaded binary files are stored locally in dev; production should use Supabase Storage private buckets.
- PDF/DOCX/XLSX/OCR extraction is scaffolded but not fully implemented.
- Trade-specific modules are lightweight issue-spotting modules. They now cover electrical, plumbing, HVAC, roofing, windows, doors/hardware, flooring, cabinets/countertops, drywall/paint, abatement, appliances, sitework, fire protection, and occupied rehab, but deeper document parsing and AI comparison are still future work.
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

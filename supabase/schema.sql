create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth0_user_id text unique not null,
  email text not null,
  name text,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_unique_idx on users (lower(email));

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  project_name text not null,
  project_address text,
  city text,
  state text,
  zip text,
  trade_type text,
  gc_name text,
  owner_name text,
  contract_amount numeric,
  bid_date date,
  execution_deadline date,
  project_type text not null,
  public_or_private text not null default 'not-sure',
  prevailing_wage_status text not null default 'not-sure',
  msa_status text not null default 'not-sure',
  status text not null default 'draft',
  risk_score integer,
  risk_level text,
  subcontract_text text not null default '',
  bid_text text not null default '',
  exclusions_text text not null default '',
  notes_text text not null default '',
  delete_documents_after_report boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  document_type text not null,
  storage_path text not null,
  file_size bigint not null,
  processing_status text not null default 'uploaded',
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists intake_answers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  question_key text not null,
  question_text text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, question_key)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text not null,
  raw_analysis_json jsonb not null,
  overall_summary text,
  risk_score integer not null,
  risk_level text not null,
  signing_recommendation text,
  intelligence_graph jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users add column if not exists password_hash text;
alter table projects add column if not exists subcontract_text text not null default '';
alter table projects add column if not exists bid_text text not null default '';
alter table projects add column if not exists exclusions_text text not null default '';
alter table projects add column if not exists notes_text text not null default '';
alter table projects add column if not exists delete_documents_after_report boolean not null default false;
alter table reviews add column if not exists intelligence_graph jsonb;

create table if not exists risk_issues (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  category text not null,
  risk_level text not null,
  issue_title text not null,
  issue_description text,
  contract_reference text,
  bid_reference text,
  document_source text,
  why_it_matters text,
  recommended_action text,
  suggested_revision text,
  status text not null default 'Open',
  owner text,
  date_resolved date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  review_id uuid not null references reviews(id) on delete cascade,
  pdf_storage_path text,
  csv_storage_path text,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table projects enable row level security;
alter table documents enable row level security;
alter table intake_answers enable row level security;
alter table reviews enable row level security;
alter table risk_issues enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;

-- The app writes through trusted server routes with the service role key. Policies remain scoped for future client-side reads.
create policy "users own profile" on users
  for all using (auth0_user_id = auth.jwt() ->> 'sub');

create policy "members see their orgs" on organization_members
  for all using (
    user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
  );

create policy "projects scoped to member org" on projects
  for all using (
    organization_id in (
      select organization_id from organization_members
      where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "documents scoped to member org" on documents
  for all using (
    organization_id in (
      select organization_id from organization_members
      where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "reviews scoped to member org" on reviews
  for all using (
    organization_id in (
      select organization_id from organization_members
      where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "reports through project membership" on reports
  for all using (
    project_id in (
      select id from projects where organization_id in (
        select organization_id from organization_members
        where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "audit logs scoped to member org" on audit_logs
  for select using (
    organization_id in (
      select organization_id from organization_members
      where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
    )
  );

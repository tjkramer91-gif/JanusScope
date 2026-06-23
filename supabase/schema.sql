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

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_type text not null default 'Other',
  trade text,
  website text,
  city text,
  state text,
  region text,
  lead_status text not null default 'new',
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
  company_id uuid references companies(id) on delete set null,
  project_name text not null,
  project_address text,
  city text,
  state text,
  region text,
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
  asset_type text,
  renovation_or_new text not null default 'unknown',
  unit_count integer,
  gross_square_feet numeric,
  rentable_square_feet numeric,
  building_count integer,
  funding_type text,
  current_phase text,
  status text not null default 'draft',
  risk_score integer,
  risk_level text,
  subcontract_text text not null default '',
  bid_text text not null default '',
  exclusions_text text not null default '',
  notes_text text not null default '',
  allowed_for_anonymized_learning boolean not null default false,
  delete_documents_after_report boolean not null default false,
  excluded_from_benchmarking boolean not null default true,
  consent_status text not null default 'not-requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  file_name text not null,
  file_type text not null,
  document_type text not null,
  storage_path text not null,
  file_path text,
  file_size bigint not null,
  processing_status text not null default 'uploaded',
  extraction_status text not null default 'metadata-only',
  extraction_confidence numeric,
  extraction_message text,
  reviewed_section_count integer,
  included_in_review boolean not null default false,
  document_category text,
  backend_document_category text,
  sensitive_data_detected boolean not null default false,
  allowed_for_anonymized_learning boolean not null default false,
  delete_after_report_generation boolean not null default false,
  excluded_from_benchmarking boolean not null default true,
  consent_status text not null default 'not-requested',
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

create table if not exists project_memory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  project_profile_summary text not null default '',
  known_scope_summary text not null default '',
  pricing_memory_summary text not null default '',
  contract_memory_summary text not null default '',
  open_questions_summary text not null default '',
  top_risks_summary text not null default '',
  decisions_summary text not null default '',
  lessons_learned_summary text not null default '',
  last_updated_at timestamptz not null default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  event_type text not null,
  event_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references users(id) on delete cascade,
  action_type text not null,
  target_table text not null,
  target_record_id text,
  action_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  related_output_id text,
  feedback_type text not null,
  rating integer,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists data_review_queue (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_table text not null,
  source_record_id text not null,
  project_id uuid references projects(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  extracted_value_summary text not null default '',
  normalized_trade text,
  normalized_scope_category text,
  normalized_scope_subcategory text,
  confidence_score numeric,
  review_status text not null default 'raw',
  reviewed_by_admin_id uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  review_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists lead_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  lead_score integer not null default 0,
  lead_status text not null default 'New',
  lead_reason text,
  high_intent_actions jsonb not null default '[]',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  budget_name text not null,
  budget_version text,
  budget_type text,
  source_type text not null default 'budget',
  city text,
  state text,
  region text,
  project_type text,
  asset_type text,
  renovation_or_new text not null default 'unknown',
  estimate_date date,
  gross_square_feet numeric,
  rentable_square_feet numeric,
  unit_count integer,
  building_count integer,
  funding_type text,
  occupied_or_vacant text not null default 'unknown',
  source_file_id uuid references documents(id) on delete set null,
  consent_status text not null default 'not-requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists budget_versions (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  version_name text not null,
  version_number integer not null default 1,
  source_file_id uuid references documents(id) on delete set null,
  uploaded_by_user_id uuid not null references users(id) on delete cascade,
  estimate_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists budget_line_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete cascade,
  budget_version_id uuid not null references budget_versions(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  source_file_id uuid references documents(id) on delete set null,
  row_number integer not null,
  cost_code text,
  csi_division text,
  raw_trade text,
  normalized_trade text,
  raw_description text,
  normalized_scope_category text,
  normalized_scope_subcategory text,
  quantity numeric,
  unit_of_measure text,
  unit_cost numeric,
  total_cost numeric,
  notes text,
  exclusions text,
  alternates text,
  is_allowance boolean not null default false,
  is_contingency boolean not null default false,
  confidence_score numeric,
  mapping_status text not null default 'raw',
  review_status text not null default 'raw',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists budget_comparisons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  current_budget_id uuid not null references budgets(id) on delete cascade,
  prior_budget_id uuid not null references budgets(id) on delete cascade,
  current_budget_version_id uuid references budget_versions(id) on delete set null,
  prior_budget_version_id uuid references budget_versions(id) on delete set null,
  comparison_name text not null,
  comparison_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists budget_comparison_results (
  id uuid primary key default gen_random_uuid(),
  budget_comparison_id uuid not null references budget_comparisons(id) on delete cascade,
  normalized_trade text,
  normalized_scope_category text,
  normalized_scope_subcategory text,
  prior_line_item_id uuid references budget_line_items(id) on delete set null,
  current_line_item_id uuid references budget_line_items(id) on delete set null,
  prior_description text,
  current_description text,
  prior_quantity numeric,
  current_quantity numeric,
  quantity_variance numeric,
  quantity_variance_percent numeric,
  prior_unit_of_measure text,
  current_unit_of_measure text,
  prior_unit_cost numeric,
  current_unit_cost numeric,
  unit_cost_variance numeric,
  unit_cost_variance_percent numeric,
  prior_total_cost numeric,
  current_total_cost numeric,
  total_cost_variance numeric,
  total_cost_variance_percent numeric,
  prior_cost_per_gsf numeric,
  current_cost_per_gsf numeric,
  prior_cost_per_rsf numeric,
  current_cost_per_rsf numeric,
  prior_cost_per_unit numeric,
  current_cost_per_unit numeric,
  prior_cost_per_building numeric,
  current_cost_per_building numeric,
  reason_for_variance text,
  risk_flag text,
  confidence_score numeric,
  recommended_question text,
  review_status text not null default 'raw',
  created_at timestamptz not null default now()
);

create table if not exists pricing_benchmark_records (
  id uuid primary key default gen_random_uuid(),
  source_budget_id uuid references budgets(id) on delete set null,
  source_budget_line_item_id uuid references budget_line_items(id) on delete set null,
  source_project_id uuid references projects(id) on delete set null,
  source_company_id uuid references companies(id) on delete set null,
  trade text,
  scope_category text,
  scope_subcategory text,
  description text,
  unit_of_measure text,
  unit_cost numeric,
  total_cost numeric,
  quantity numeric,
  cost_per_gross_sf numeric,
  cost_per_rentable_sf numeric,
  cost_per_unit numeric,
  cost_per_building numeric,
  city text,
  state text,
  region text,
  project_type text,
  asset_type text,
  renovation_or_new text,
  funding_type text,
  estimate_date date,
  source_type text,
  consent_status text not null default 'not-requested',
  review_status text not null default 'raw',
  confidence_score numeric,
  approved_by_admin_id uuid references users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table users add column if not exists password_hash text;
alter table users add column if not exists role text not null default 'member';
alter table users add column if not exists company_id uuid references companies(id) on delete set null;
alter table users add column if not exists account_type text not null default 'individual';
alter table users add column if not exists is_admin boolean not null default false;
alter table users add column if not exists last_login_at timestamptz;
alter table lead_scores add column if not exists lead_status text not null default 'New';
alter table projects add column if not exists company_id uuid references companies(id) on delete set null;
alter table projects add column if not exists region text;
alter table projects add column if not exists asset_type text;
alter table projects add column if not exists renovation_or_new text not null default 'unknown';
alter table projects add column if not exists unit_count integer;
alter table projects add column if not exists gross_square_feet numeric;
alter table projects add column if not exists rentable_square_feet numeric;
alter table projects add column if not exists building_count integer;
alter table projects add column if not exists funding_type text;
alter table projects add column if not exists current_phase text;
alter table projects add column if not exists subcontract_text text not null default '';
alter table projects add column if not exists bid_text text not null default '';
alter table projects add column if not exists exclusions_text text not null default '';
alter table projects add column if not exists notes_text text not null default '';
alter table projects add column if not exists allowed_for_anonymized_learning boolean not null default false;
alter table projects add column if not exists delete_documents_after_report boolean not null default false;
alter table projects add column if not exists excluded_from_benchmarking boolean not null default true;
alter table projects add column if not exists consent_status text not null default 'not-requested';
alter table documents add column if not exists company_id uuid references companies(id) on delete set null;
alter table documents add column if not exists file_path text;
alter table documents add column if not exists extraction_status text not null default 'metadata-only';
alter table documents add column if not exists extraction_confidence numeric;
alter table documents add column if not exists extraction_message text;
alter table documents add column if not exists reviewed_section_count integer;
alter table documents add column if not exists included_in_review boolean not null default false;
alter table documents add column if not exists document_category text;
alter table documents add column if not exists backend_document_category text;
alter table documents add column if not exists sensitive_data_detected boolean not null default false;
alter table documents add column if not exists allowed_for_anonymized_learning boolean not null default false;
alter table documents add column if not exists delete_after_report_generation boolean not null default false;
alter table documents add column if not exists excluded_from_benchmarking boolean not null default true;
alter table documents add column if not exists consent_status text not null default 'not-requested';
alter table reviews add column if not exists intelligence_graph jsonb;
alter table data_review_queue add column if not exists normalized_trade text;
alter table data_review_queue add column if not exists normalized_scope_category text;
alter table data_review_queue add column if not exists normalized_scope_subcategory text;
alter table data_review_queue add column if not exists review_metadata jsonb not null default '{}';

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
alter table companies enable row level security;
alter table organization_members enable row level security;
alter table projects enable row level security;
alter table documents enable row level security;
alter table intake_answers enable row level security;
alter table reviews enable row level security;
alter table project_memory enable row level security;
alter table usage_events enable row level security;
alter table admin_audit_log enable row level security;
alter table feedback enable row level security;
alter table data_review_queue enable row level security;
alter table lead_scores enable row level security;
alter table budgets enable row level security;
alter table budget_versions enable row level security;
alter table budget_line_items enable row level security;
alter table budget_comparisons enable row level security;
alter table budget_comparison_results enable row level security;
alter table pricing_benchmark_records enable row level security;
alter table risk_issues enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;

-- The app writes through trusted server routes with the service role key. Policies remain scoped for future client-side reads.
create policy "users own profile" on users
  for all using (auth0_user_id = auth.jwt() ->> 'sub');

create policy "companies scoped to user profile" on companies
  for select using (
    id in (select company_id from users where auth0_user_id = auth.jwt() ->> 'sub')
  );

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

create policy "project memory through project membership" on project_memory
  for select using (
    project_id in (
      select id from projects where organization_id in (
        select organization_id from organization_members
        where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "usage events own rows" on usage_events
  for select using (
    user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
  );

create policy "admin audit log admin only" on admin_audit_log
  for select using (
    exists (
      select 1 from users
      where auth0_user_id = auth.jwt() ->> 'sub'
      and is_admin = true
    )
  );

create policy "feedback own rows" on feedback
  for select using (
    user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
  );

create policy "data review queue admin only" on data_review_queue
  for select using (
    exists (
      select 1 from users
      where auth0_user_id = auth.jwt() ->> 'sub'
      and is_admin = true
    )
  );

create policy "pricing benchmarks admin only" on pricing_benchmark_records
  for select using (
    exists (
      select 1 from users
      where auth0_user_id = auth.jwt() ->> 'sub'
      and is_admin = true
    )
  );

create policy "lead scores owner or admin" on lead_scores
  for select using (
    user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
    or exists (
      select 1 from users
      where auth0_user_id = auth.jwt() ->> 'sub'
      and is_admin = true
    )
  );

create policy "budgets through project membership" on budgets
  for all using (
    project_id in (
      select id from projects where organization_id in (
        select organization_id from organization_members
        where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "budget versions through project membership" on budget_versions
  for all using (
    project_id in (
      select id from projects where organization_id in (
        select organization_id from organization_members
        where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "budget line items through project membership" on budget_line_items
  for all using (
    project_id in (
      select id from projects where organization_id in (
        select organization_id from organization_members
        where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "budget comparisons through project membership" on budget_comparisons
  for all using (
    project_id in (
      select id from projects where organization_id in (
        select organization_id from organization_members
        where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "budget comparison results through comparison membership" on budget_comparison_results
  for all using (
    budget_comparison_id in (
      select id from budget_comparisons where project_id in (
        select id from projects where organization_id in (
          select organization_id from organization_members
          where user_id in (select id from users where auth0_user_id = auth.jwt() ->> 'sub')
        )
      )
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

create schema if not exists private;

create table public.source_registry (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  display_name text not null,
  source_type text not null check (source_type in ('news','hazard','blockchain','research')),
  endpoint_host text not null,
  attribution_url text not null,
  enabled boolean not null default true,
  coverage_note text not null default '',
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_registry_https check (attribution_url ~ '^https://')
);

create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.source_registry(id) on delete restrict,
  external_id text not null,
  category text not null check (category in ('disasters','conflict','politics','economy','health','cyber','science','energy','other')),
  title text not null check (length(title) between 1 and 500),
  summary text,
  canonical_url text not null check (canonical_url ~ '^https?://'),
  source_domain text not null,
  language_code text,
  source_country text,
  published_at timestamptz,
  observed_at timestamptz not null default now(),
  fetched_at timestamptz not null default now(),
  content_hash text,
  evidence_class text not null default 'unverified' check (evidence_class in ('verified','corroborated','unverified','analysis')),
  metadata jsonb not null default '{}'::jsonb,
  unique (source_id, external_id)
);
create index news_items_published_idx on public.news_items (published_at desc nulls last);
create index news_items_category_published_idx on public.news_items (category, published_at desc nulls last);
create index news_items_source_domain_idx on public.news_items (source_domain);

create table public.hazard_events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.source_registry(id) on delete restrict,
  external_id text not null,
  hazard_type text not null check (hazard_type in ('earthquake','flood','wildfire','storm','volcano','tsunami','drought','other')),
  title text not null,
  description text,
  severity_label text,
  magnitude numeric(10,3),
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  location_label text,
  occurred_at timestamptz,
  observed_at timestamptz not null default now(),
  source_url text not null check (source_url ~ '^https?://'),
  status text not null default 'active' check (status in ('active','updated','closed','unknown')),
  properties jsonb not null default '{}'::jsonb,
  unique (source_id, external_id)
);
create index hazard_events_occurred_idx on public.hazard_events (occurred_at desc nulls last);
create index hazard_events_type_idx on public.hazard_events (hazard_type, occurred_at desc nulls last);

create table public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  assessment_key text not null unique,
  title text not null,
  summary text not null,
  risk_score smallint not null check (risk_score between 0 and 100),
  confidence numeric(5,4) check (confidence between 0 and 1),
  evidence_class text not null check (evidence_class in ('documented','plausible','disputed','speculative','symbolic')),
  source_ids uuid[] not null default '{}',
  factors jsonb not null default '[]'::jsonb,
  methodology_version text not null,
  model_label text,
  generated_at timestamptz not null default now(),
  expires_at timestamptz,
  is_demo boolean not null default true
);
create index risk_assessments_generated_idx on public.risk_assessments (generated_at desc);
create index risk_assessments_score_idx on public.risk_assessments (risk_score desc, generated_at desc);

create table public.agent_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  description text not null,
  category text not null check (category in ('disaster','cybersecurity','news_verification','infrastructure','research','governance')),
  capability_level text not null check (capability_level in ('demo','prototype','planned','disabled')),
  requires_external_credentials boolean not null default false,
  testnet_enabled boolean not null default false,
  mainnet_enabled boolean not null default false check (mainnet_enabled = false),
  safety_notes text not null default '',
  config_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scenario_snapshots (
  id uuid primary key default gen_random_uuid(),
  scenario_key text not null,
  title text not null,
  narrative text not null,
  horizon text not null check (horizon in ('24h','7d','30d','90d','symbolic')),
  probability numeric(5,4) check (probability between 0 and 1),
  impact_score smallint check (impact_score between 0 and 100),
  evidence_class text not null check (evidence_class in ('documented','plausible','disputed','speculative','symbolic')),
  assumptions jsonb not null default '[]'::jsonb,
  source_ids uuid[] not null default '{}',
  generated_at timestamptz not null default now(),
  is_demo boolean not null default true
);
create index scenario_snapshots_generated_idx on public.scenario_snapshots (generated_at desc);

create table private.payment_intents (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  pi_payment_id text unique,
  pi_user_uid text not null,
  amount_pi numeric(30,7) not null check (amount_pi > 0),
  network text not null default 'testnet' check (network = 'testnet'),
  status text not null default 'created' check (status in ('created','approved','completed','cancelled','failed','reconciliation_required')),
  memo text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index payment_intents_user_idx on private.payment_intents (pi_user_uid, created_at desc);
create index payment_intents_status_idx on private.payment_intents (status, created_at);

create table private.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  account_code text not null unique,
  owner_pi_uid text,
  currency text not null default 'PI' check (currency = 'PI'),
  account_type text not null check (account_type in ('user_credit','merchant_payable','platform_clearing','fee_expense','refunds')),
  created_at timestamptz not null default now()
);

create table private.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  payment_intent_id uuid references private.payment_intents(id) on delete restrict,
  transaction_type text not null check (transaction_type in ('top_up','service_charge','refund','settlement','adjustment')),
  network text not null default 'testnet' check (network = 'testnet'),
  status text not null default 'pending' check (status in ('pending','posted','reversed')),
  created_at timestamptz not null default now(),
  posted_at timestamptz
);

create table private.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references private.ledger_transactions(id) on delete restrict,
  account_id uuid not null references private.ledger_accounts(id) on delete restrict,
  entry_side text not null check (entry_side in ('debit','credit')),
  amount_pi numeric(30,7) not null check (amount_pi > 0),
  created_at timestamptz not null default now()
);
create index ledger_entries_transaction_idx on private.ledger_entries (transaction_id);
create index ledger_entries_account_idx on private.ledger_entries (account_id, created_at desc);

create or replace function private.reject_ledger_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Ledger entries are immutable; append a compensating transaction';
end;
$$;
create trigger ledger_entries_immutable
before update or delete on private.ledger_entries
for each row execute function private.reject_ledger_mutation();

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger payment_intents_updated_at
before update on private.payment_intents
for each row execute function private.set_updated_at();

alter table public.source_registry enable row level security;
alter table public.news_items enable row level security;
alter table public.hazard_events enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.agent_templates enable row level security;
alter table public.scenario_snapshots enable row level security;
alter table private.payment_intents enable row level security;
alter table private.ledger_accounts enable row level security;
alter table private.ledger_transactions enable row level security;
alter table private.ledger_entries enable row level security;

create policy "public read source registry" on public.source_registry for select to anon, authenticated using (enabled = true);
create policy "public read news items" on public.news_items for select to anon, authenticated using (true);
create policy "public read hazard events" on public.hazard_events for select to anon, authenticated using (true);
create policy "public read risk assessments" on public.risk_assessments for select to anon, authenticated using (true);
create policy "public read agent templates" on public.agent_templates for select to anon, authenticated using (true);
create policy "public read scenario snapshots" on public.scenario_snapshots for select to anon, authenticated using (true);

revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.source_registry, public.news_items, public.hazard_events, public.risk_assessments, public.agent_templates, public.scenario_snapshots to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.source_registry, public.news_items, public.hazard_events, public.risk_assessments, public.agent_templates, public.scenario_snapshots from anon, authenticated;

insert into public.source_registry (source_key,display_name,source_type,endpoint_host,attribution_url,coverage_note) values
('gdelt-doc','GDELT DOC 2.0','news','api.gdeltproject.org','https://www.gdeltproject.org/','Global news index; not exhaustive and not a guaranteed real-time wire service.'),
('usgs-earthquakes','USGS Earthquake Hazards','hazard','earthquake.usgs.gov','https://earthquake.usgs.gov/','Earthquake feeds; coverage depends on seismic reporting and feed availability.'),
('nasa-eonet','NASA EONET','hazard','eonet.gsfc.nasa.gov','https://eonet.gsfc.nasa.gov/','Curated Earth observation events; not every local hazard is represented.'),
('pi-testnet-horizon','Pi Testnet Horizon','blockchain','api.testnet.minepi.com','https://developers.minepi.com/','Read-only Testnet telemetry; no signing or payment execution enabled.')
on conflict (source_key) do nothing;

insert into public.agent_templates (template_key,name,description,category,capability_level,testnet_enabled,mainnet_enabled,safety_notes)
values
('global-disaster-watch','Global Disaster Watch','Aggregates attributed earthquake, wildfire, storm and other hazard feeds for situational awareness.','disaster','prototype',false,false,'Advisory only; source coverage is incomplete and alerts require source verification.'),
('cyber-threat-watch','Cyber Threat Watch','Organizes public cyber incident reporting and highlights source-backed indicators.','cybersecurity','prototype',false,false,'No scanning, exploitation, or automated response actions.'),
('news-source-verifier','News Source Verifier','Compares publisher attribution, timestamps, and corroborating public reports.','news_verification','prototype',false,false,'Does not determine truth from a single source; human review required.'),
('pi-testnet-observer','Pi Testnet Observer','Reads public Testnet Horizon telemetry and reports ledger/network status.','infrastructure','demo',false,false,'Read-only observer; no wallet signing, transfers, or Mainnet operations.')
on conflict (template_key) do nothing;

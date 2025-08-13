-- SCHEMA 2.0 — Core (selected; safe to run in a new DB; adjust for Supabase)

create schema if not exists ref;
create schema if not exists deals;
create schema if not exists investors;
create schema if not exists companies;
create schema if not exists fees;
create schema if not exists valuations;
create schema if not exists calc;
create schema if not exists documents;
create schema if not exists payments;
create schema if not exists transactions;
create schema if not exists reconcile;
create schema if not exists fx;
create schema if not exists secondary;
create schema if not exists comms;
create schema if not exists api;
create schema if not exists integrations;
create schema if not exists accounting;
create schema if not exists revrec;
create schema if not exists tax;
create schema if not exists news;
create schema if not exists mobile;
create schema if not exists ops;

-- Referentials
create table if not exists ref.deal_stage (code text primary key);
create table if not exists ref.deal_type (code text primary key);
create table if not exists ref.company_type (code text primary key);
create table if not exists ref.investor_type (code text primary key);
create table if not exists ref.document_type (code text primary key);
create table if not exists ref.fee_component (code text primary key);
create table if not exists ref.fee_basis (code text primary key);

-- Companies
create table if not exists companies.company (
  id bigserial primary key,
  public_id uuid default gen_random_uuid() unique,
  name text not null,
  type text references ref.company_type(code),
  sector text,
  country text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists companies.round (
  id bigserial primary key,
  company_id bigint not null references companies.company(id) on delete cascade,
  round_name text,
  date date,
  price_per_unit numeric(20,4),
  pre_money numeric(20,4),
  post_money numeric(20,4),
  notes text
);

create table if not exists companies.metric (
  id bigserial primary key,
  company_id bigint not null references companies.company(id) on delete cascade,
  as_of date not null,
  valuation numeric(20,4),
  arr numeric(20,4),
  gross_margin numeric(20,8),
  unique (company_id, as_of)
);

-- Deals
create table if not exists deals.deal (
  id bigserial primary key,
  public_id uuid default gen_random_uuid() unique,
  company_id bigint references companies.company(id),
  code text unique,
  slug text unique,
  name text not null,
  type text references ref.deal_type(code),
  stage text not null references ref.deal_stage(code),
  currency char(3) not null,
  opening_date date,
  closing_date date,
  unit_price_init numeric(20,4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists deals.identifier (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  kind text check (kind in ('code','slug','alias')),
  value text not null,
  is_active boolean default true,
  unique (deal_id, kind, value)
);

create table if not exists deals.status_history (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  from_stage text references ref.deal_stage(code),
  to_stage text references ref.deal_stage(code),
  reason text,
  changed_by uuid,
  changed_at timestamptz default now()
);

create table if not exists deals.owner_map (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  user_id uuid not null,
  role text check (role in ('owner','editor','viewer')),
  unique (deal_id, user_id)
);

-- Fees
create table if not exists fees.schedule (
  id bigserial primary key,
  name text not null,
  party_type text check (party_type in ('partner','investor')),
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists fees.schedule_version (
  id bigserial primary key,
  schedule_id bigint not null references fees.schedule(id) on delete cascade,
  version_no int not null,
  effective_from date not null,
  effective_to date,
  is_active boolean default false,
  unique (schedule_id, version_no)
);

create table if not exists fees.schedule_component (
  id bigserial primary key,
  schedule_version_id bigint not null references fees.schedule_version(id) on delete cascade,
  component text not null references ref.fee_component(code),
  basis text not null references ref.fee_basis(code),
  rate numeric(20,8),
  min_fee numeric(20,4),
  cap_amount numeric(20,4),
  metadata jsonb default '{}'::jsonb
);

create table if not exists fees.link_deal (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  schedule_id bigint not null references fees.schedule(id),
  active_version bigint not null references fees.schedule_version(id),
  party_type text not null check (party_type in ('partner','investor')),
  created_at timestamptz default now(),
  unique (deal_id, party_type)
);

create table if not exists fees.validator_run (
  id bigserial primary key,
  deal_id bigint references deals.deal(id),
  schedule_id bigint references fees.schedule(id),
  kind text check (kind in ('termsheet-compare','overlap-check','basis-check')),
  passed boolean,
  details jsonb,
  run_at timestamptz default now()
);

create table if not exists fees.preview_cache (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  party_type text check (party_type in ('partner','investor')),
  as_of date not null,
  preview_json jsonb not null,
  computed_at timestamptz default now(),
  unique (deal_id, party_type, as_of)
);

create table if not exists fees.ledger (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  investor_id bigint references investors.investor(id),
  party_type text check (party_type in ('partner','investor')),
  component text references ref.fee_component(code),
  period_start date not null,
  period_end date not null,
  currency char(3) not null,
  amount numeric(20,4) not null,
  basis_json jsonb,
  status text default 'pending' check (status in ('pending','posted','settled','written_off')),
  created_at timestamptz default now()
);

create table if not exists fees.posting (
  id bigserial primary key,
  fee_ledger_id bigint not null references fees.ledger(id) on delete cascade,
  transaction_id bigint references transactions.transaction(id),
  posted_at timestamptz default now(),
  unique (fee_ledger_id, transaction_id)
);

-- Investors & KYC & Payments
create table if not exists investors.investor (
  id bigserial primary key,
  public_id uuid default gen_random_uuid() unique,
  full_name text not null,
  primary_email text not null unique,
  type text references ref.investor_type(code),
  country_residence text,
  status text default 'active' check (status in ('active','blocked','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists kyc_case (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  status text default 'pending' check (status in ('pending','approved','rejected','expired')),
  pep_flag boolean default false,
  expires_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists kyc_check (
  id bigserial primary key,
  case_id bigint not null references kyc_case(id) on delete cascade,
  kind text check (kind in ('sanctions','pep','idv','proof_of_address')),
  result text check (result in ('clear','review','match')),
  details jsonb,
  created_at timestamptz default now()
);

create table if not exists payments.method (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  type text check (type in ('wire','card','banktransfer')),
  label text,
  vault_token text,
  status text default 'active' check (status in ('active','inactive','revoked')),
  created_at timestamptz default now(),
  unique (investor_id, type, label)
);

create table if not exists investors.commitment (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  currency char(3) not null,
  amount numeric(20,4) not null,
  status text default 'signed' check (status in ('draft','signed','cancelled')),
  created_at timestamptz default now(),
  unique (investor_id, deal_id)
);

create table if not exists payments.inbound (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  deal_id bigint references deals.deal(id),
  method_id bigint references payments.method(id),
  kind text check (kind in ('capitalcall','topup','fees','unapplied','refund_request')),
  value_date date not null,
  reference text,
  currency char(3) not null,
  amount numeric(20,4) not null,
  status text default 'pending' check (status in ('pending','cleared','failed','reversed')),
  created_at timestamptz default now()
);

create table if not exists payments.outbound (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  deal_id bigint references deals.deal(id),
  kind text check (kind in ('distribution','refund')),
  currency char(3) not null,
  amount numeric(20,4) not null,
  status text default 'queued' check (status in ('queued','sent','failed','returned')),
  created_at timestamptz default now()
);

create table if not exists investors.wallet (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  currency char(3) not null,
  balance numeric(20,4) not null default 0,
  unique (investor_id, currency)
);

create table if not exists investors.wallet_ledger (
  id bigserial primary key,
  wallet_id bigint not null references investors.wallet(id) on delete cascade,
  txn_type text check (txn_type in ('topup','fee_apply','distribution','refund','adjustment')),
  amount numeric(20,4) not null,
  reference text,
  created_at timestamptz default now()
);

create table if not exists investors.statement (
  id bigserial primary key,
  investor_id bigint not null references investors.investor(id) on delete cascade,
  period daterange not null,
  type text check (type in ('monthly','annual','tax')),
  url text,
  created_at timestamptz default now(),
  unique (investor_id, period, type)
);

-- Transactions & Journal & FX & Reconcile
create table if not exists transactions.account (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  currency char(3),
  kind text check (kind in ('asset','liability','equity','revenue','expense'))
);

create table if not exists transactions.transaction (
  id bigserial primary key,
  public_id uuid default gen_random_uuid() unique,
  deal_id bigint references deals.deal(id),
  investor_id bigint references investors.investor(id),
  occurred_on date not null,
  currency char(3) not null,
  amount numeric(20,4) not null,
  type text check (type in ('commit','receipt','distribution','refund','fee','adjustment')),
  status text default 'booked' check (status in ('pending','booked','cancelled')),
  idempotency_key text,
  created_at timestamptz default now(),
  unique (idempotency_key)
);

create table if not exists transactions.journal (
  id bigserial primary key,
  transaction_id bigint not null references transactions.transaction(id) on delete cascade,
  account_id bigint not null references transactions.account(id),
  currency char(3) not null,
  amount numeric(20,4) not null,
  memo text
);

create table if not exists fx.rate (
  id bigserial primary key,
  base char(3) not null,
  quote char(3) not null,
  as_of date not null,
  rate numeric(20,8) not null,
  source text,
  unique (base, quote, as_of, source)
);

create table if not exists reconcile.bank_line (
  id bigserial primary key,
  bank_account text,
  value_date date,
  currency char(3) not null,
  amount numeric(20,4) not null,
  reference text,
  raw_payload jsonb,
  imported_at timestamptz default now()
);

create table if not exists reconcile.match (
  id bigserial primary key,
  bank_line_id bigint not null references reconcile.bank_line(id) on delete cascade,
  transaction_id bigint references transactions.transaction(id),
  status text check (status in ('auto','manual','rejected')),
  reason_code text,
  matched_at timestamptz default now(),
  unique (bank_line_id)
);

-- Valuations & Calc
create table if not exists valuations.nav_snapshot (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  as_of date not null,
  nav numeric(20,4) not null,
  fx_rate numeric(20,8),
  source text,
  created_at timestamptz default now(),
  unique (deal_id, as_of)
);

create table if not exists valuations.metric_snapshot (
  id bigserial primary key,
  deal_id bigint not null references deals.deal(id) on delete cascade,
  as_of date not null,
  irr numeric(20,8),
  moic numeric(20,8),
  computed_from jsonb,
  created_at timestamptz default now(),
  unique (deal_id, as_of)
);

create table if not exists calc.waterfall_run (
  id bigserial primary key,
  deal_id bigint references deals.deal(id),
  scenario text check (scenario in ('exit','secondary','downround')),
  inputs jsonb not null,
  result jsonb,
  computed_at timestamptz default now()
);

-- Documents
create table if not exists documents.document (
  id bigserial primary key,
  public_id uuid default gen_random_uuid() unique,
  name text not null,
  type text references ref.document_type(code),
  mime_type text,
  storage_url text,
  hashing text,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists documents.version (
  id bigserial primary key,
  document_id bigint not null references documents.document(id) on delete cascade,
  version_no int not null,
  storage_url text not null,
  created_at timestamptz default now(),
  unique (document_id, version_no)
);

create table if not exists documents.link (
  id bigserial primary key,
  document_id bigint not null references documents.document(id) on delete cascade,
  entity_type text check (entity_type in ('deal','investor','company','transaction')),
  entity_id bigint not null,
  role text,
  status text default 'linked',
  created_at timestamptz default now(),
  unique (document_id, entity_type, entity_id, role)
);

create table if not exists documents.classification (
  id bigserial primary key,
  document_id bigint not null references documents.document(id) on delete cascade,
  label text references ref.document_type(code),
  confidence numeric(5,4),
  created_at timestamptz default now()
);

create table if not exists documents.extraction (
  id bigserial primary key,
  document_id bigint not null references documents.document(id) on delete cascade,
  extractor text check (extractor in ('termsheet','allocationsheet','operatingagreement','sideletter','subscription-agreement','engagement-letter')),
  fields_json jsonb not null,
  confidence numeric(5,4),
  created_at timestamptz default now()
);

create table if not exists documents.ocr_job (
  id bigserial primary key,
  document_id bigint not null references documents.document(id) on delete cascade,
  status text default 'queued' check (status in ('queued','running','completed','failed')),
  result_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists documents.evidence_log (
  id bigserial primary key,
  document_id bigint not null references documents.document(id) on delete cascade,
  action text,
  actor_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Secondaries
create table if not exists secondary.listing (
  id bigserial primary key,
  deal_id bigint references deals.deal(id),
  seller_id bigint references investors.investor(id),
  units numeric(20,8) not null,
  min_price numeric(20,4),
  status text default 'open' check (status in ('open','matched','withdrawn','expired')),
  created_at timestamptz default now()
);

create table if not exists secondary.bid (
  id bigserial primary key,
  listing_id bigint references secondary.listing(id) on delete cascade,
  buyer_id bigint references investors.investor(id),
  units numeric(20,8),
  price numeric(20,4),
  status text default 'open' check (status in ('open','accepted','rejected','expired')),
  created_at timestamptz default now()
);

create table if not exists secondary.match (
  id bigserial primary key,
  listing_id bigint references secondary.listing(id),
  bid_id bigint references secondary.bid(id),
  matched_at timestamptz default now(),
  settlement_status text default 'pending' check (settlement_status in ('pending','settled','failed'))
);

create table if not exists secondary.transfer (
  id bigserial primary key,
  match_id bigint references secondary.match(id),
  kyc_ok boolean default false,
  docs_ok boolean default false,
  executed_at timestamptz
);

create table if not exists secondary.window (
  id bigserial primary key,
  deal_id bigint references deals.deal(id),
  starts_at timestamptz,
  ends_at timestamptz
);

-- Comms
create table if not exists comms.template (
  id bigserial primary key,
  name text not null,
  channel text check (channel in ('email','whatsapp','sms','push','inapp')),
  locale text default 'en',
  subject text,
  body_md text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists comms.send (
  id bigserial primary key,
  template_id bigint references comms.template(id),
  channel text,
  recipient_type text,
  recipient_id bigint,
  context_json jsonb,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text default 'queued' check (status in ('queued','sent','delivered','failed','bounced','unsubscribed')),
  provider_id text
);

create table if not exists comms.event (
  id bigserial primary key,
  send_id bigint references comms.send(id) on delete cascade,
  name text,
  at timestamptz default now(),
  meta jsonb
);

create table if not exists comms.preference (
  id bigserial primary key,
  investor_id bigint references investors.investor(id),
  channel text,
  topic text,
  status text default 'subscribed' check (status in ('subscribed','unsubscribed')),
  unique (investor_id, channel, topic)
);

create table if not exists comms.immutable_log (
  id bigserial primary key,
  hash_prev text,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Integrations, API, Accounting, Tax, News, Mobile, Ops (headers only)
create table if not exists integrations.credential (
  id bigserial primary key,
  provider text not null,
  label text,
  secret_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (provider, label)
);

create table if not exists api.webhook_in (
  id bigserial primary key,
  provider text not null,
  signature text,
  payload jsonb not null,
  received_at timestamptz default now()
);

create table if not exists api.webhook_out (
  id bigserial primary key,
  subscriber text not null,
  event_name text not null,
  payload jsonb not null,
  status text default 'pending' check (status in ('pending','delivered','failed')),
  attempt_count int default 0,
  created_at timestamptz default now()
);

create table if not exists api.delivery_attempt (
  id bigserial primary key,
  webhook_out_id bigint references api.webhook_out(id) on delete cascade,
  status text,
  response_code int,
  response_ms int,
  created_at timestamptz default now()
);

create table if not exists accounting.journal_batch (
  id bigserial primary key,
  external_system text default 'qbo',
  period daterange not null,
  status text default 'open' check (status in ('open','posted','failed','rolled_back')),
  created_at timestamptz default now()
);

create table if not exists accounting.journal_line (
  id bigserial primary key,
  batch_id bigint references accounting.journal_batch(id) on delete cascade,
  account_id bigint references transactions.account(id),
  currency char(3),
  amount numeric(20,4),
  memo text
);

create table if not exists accounting.export_batch (
  id bigserial primary key,
  system text,
  status text default 'pending',
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists accounting.period_close (
  id bigserial primary key,
  period daterange unique not null,
  closed_by uuid,
  closed_at timestamptz
);

create table if not exists revrec.schedule (
  id bigserial primary key,
  fee_ledger_id bigint references fees.ledger(id),
  start_on date,
  end_on date,
  rule text,
  created_at timestamptz default now()
);

create table if not exists tax.withholding_rule (
  id bigserial primary key,
  country text not null,
  treaty text,
  rate numeric(6,4) not null,
  effective_from date not null,
  effective_to date
);

create table if not exists tax.form (
  id bigserial primary key,
  investor_id bigint references investors.investor(id),
  type text check (type in ('W-8','W-9')),
  document_id bigint references documents.document(id),
  received_at timestamptz,
  expires_at timestamptz
);

create table if not exists tax.withholding_applied (
  id bigserial primary key,
  transaction_id bigint references transactions.transaction(id),
  rule_id bigint references tax.withholding_rule(id),
  amount numeric(20,4),
  created_at timestamptz default now()
);

create table if not exists news.source (
  id bigserial primary key,
  name text,
  url text,
  weight int default 1
);

create table if not exists news.item (
  id bigserial primary key,
  source_id bigint references news.source(id),
  title text,
  url text,
  published_at timestamptz,
  sentiment text,
  raw jsonb,
  deal_id bigint references deals.deal(id),
  company_id bigint references companies.company(id)
);

create table if not exists news.subscription (
  id bigserial primary key,
  investor_id bigint references investors.investor(id),
  company_id bigint,
  deal_id bigint
);

create table if not exists news.digest (
  id bigserial primary key,
  run_at timestamptz default now(),
  audience jsonb,
  url text
);

create table if not exists mobile.push_token (
  id bigserial primary key,
  user_id uuid,
  token text unique,
  platform text,
  created_at timestamptz default now()
);

create table if not exists ops.audit_log (
  id bigserial primary key,
  actor uuid,
  action text,
  entity text,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip inet,
  ua text,
  created_at timestamptz default now()
);

create table if not exists ops.health_check (
  id bigserial primary key,
  name text,
  status text,
  checked_at timestamptz default now()
);

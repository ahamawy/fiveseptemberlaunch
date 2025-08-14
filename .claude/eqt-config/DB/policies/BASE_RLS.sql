-- Enable RLS and add safe defaults (deny by default)
-- Example pattern: each table has a tenant_id and created_by

-- alter table deals.deal enable row level security;
-- create policy "deal_select" on deals.deal
--   for select using (auth.role() = 'service_role' or tenant_id = current_setting('eqt.tenant_id', true)::uuid);
-- create policy "deal_insert" on deals.deal
--   for insert with check (auth.role() = 'service_role' or tenant_id = current_setting('eqt.tenant_id', true)::uuid);

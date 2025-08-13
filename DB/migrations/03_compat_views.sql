-- Optional: back-compat views to old public.* tables
-- example:
create or replace view public."001_deals" as
select id as deal_id, name as deal_name, type as deal_type, company_id as underlying_company_id,
       closing_date, created_at, updated_at, stage as deal_status
from deals.deal;

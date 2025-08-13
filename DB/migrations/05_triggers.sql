-- updated_at bump trigger (example)
create or replace function ops.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_deal_touch on deals.deal;
create trigger trg_deal_touch before update on deals.deal
for each row execute function ops.touch_updated_at();

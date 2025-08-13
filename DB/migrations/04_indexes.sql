-- Add high-value indexes
create index if not exists idx_deals_stage on deals.deal(stage);
create index if not exists idx_fees_ledger_period on fees.ledger(deal_id, period_start, period_end);
create index if not exists idx_docs_link_entity on documents.link(entity_type, entity_id);
create index if not exists idx_txn_deal_date on transactions.transaction(deal_id, occurred_on);

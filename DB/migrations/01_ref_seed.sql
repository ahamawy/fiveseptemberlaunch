-- Seed reference data (example; extend as needed)
insert into ref.deal_stage(code) values ('draft'),('review'),('live'),('closed'),('exited') on conflict do nothing;
insert into ref.deal_type(code) values ('equity'),('spv'),('direct'),('secondary') on conflict do nothing;
insert into ref.company_type(code) values ('operating'),('holding'),('spv') on conflict do nothing;
insert into ref.investor_type(code) values ('individual'),('entity'),('fund') on conflict do nothing;
insert into ref.document_type(code) values ('termsheet'),('operatingagreement'),('allocationsheet'),('sideletter'),('subscription-agreement'),('engagement-letter') on conflict do nothing;
insert into ref.fee_component(code) values ('management'),('performance'),('structuring'),('premium'),('other'),('default') on conflict do nothing;
insert into ref.fee_basis(code) values ('committed'),('deployed'),('nav'),('fixed') on conflict do nothing;

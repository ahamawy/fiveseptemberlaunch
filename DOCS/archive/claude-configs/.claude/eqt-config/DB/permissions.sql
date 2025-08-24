-- Schema usage
grant usage on schema deals, investors, transactions, documents, fees, valuations, calc, secondary, comms to authenticated, anon;
grant select on all tables in schema deals, investors, transactions, documents, fees, valuations, calc, secondary, comms to authenticated;

-- Future tables auto-grant (run after each migration)
alter default privileges in schema deals grant select on tables to authenticated;
alter default privileges in schema deals grant usage, select on sequences to authenticated;

-- Service role elevated (server-side jobs only)
grant all privileges on all tables in schema deals, investors, transactions, documents, fees, valuations, calc, secondary, comms to eqt_service;
grant usage, select, update on all sequences in schema deals, investors, transactions, documents, fees, valuations, calc, secondary, comms to eqt_service;

-- App roles (Supabase maps JWTs to 'anon' or 'authenticated' roles).
-- These grants support local Postgres use too.
create role eqt_readonly nologin;
create role eqt_writer nologin;
create role eqt_service nologin;  -- mapped to service-role usage only

-- Example: attach to supabase roles if desired
grant eqt_readonly to authenticated;
grant eqt_readonly to anon;
grant eqt_writer to authenticated; -- keep carefully scoped

-- Service gets broader access (still prefer RLS allowlists).
grant eqt_service to postgres;

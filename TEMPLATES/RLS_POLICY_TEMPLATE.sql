-- Row Level Security template for <feature-code> <feature-slug>
-- alter table <schema>.<table> enable row level security;

-- create policy <policy_name> on <schema>.<table>
-- for select using ( auth.uid() is not null /* tighten */ );

-- create policy <policy_name> on <schema>.<table>
-- for insert with check ( /* ownership rule */ );

-- =============================================================================
-- Waitlist Table
-- =============================================================================
-- Stores early-access signups for the Konstruct waitlist/coming-soon page.
-- Anyone can insert (public form) and read count (social proof).
-- =============================================================================

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  source text default 'landing',
  created_at timestamptz default now() not null
);

alter table waitlist enable row level security;

-- Anyone can insert (public form)
create policy "Anyone can insert into waitlist"
  on waitlist for insert
  with check (true);

-- Anyone can read (for signup count / social proof)
create policy "Anyone can read waitlist"
  on waitlist for select
  using (true);

-- Index for counting signups
create index if not exists idx_waitlist_created_at on waitlist (created_at);

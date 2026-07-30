-- Add verification columns to evidence table
alter table evidence add column if not exists verified_by uuid references profiles(id) on delete set null;
alter table evidence add column if not exists verified_at timestamptz;

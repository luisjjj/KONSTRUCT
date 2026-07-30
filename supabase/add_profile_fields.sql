-- Add phone and organization columns to profiles table
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists organization text;

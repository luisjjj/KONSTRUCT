-- Add missing columns to projects table
alter table projects add column if not exists address text;
alter table projects add column if not exists project_type text default 'Residential';
alter table projects add column if not exists start_date text;
alter table projects add column if not exists expected_end_date text;

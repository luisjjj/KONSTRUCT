-- Create project invites table
create table if not exists project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  email text not null,
  role text not null check (role in ('contractor', 'verifier')),
  invited_by uuid references profiles(id) on delete set null not null,
  accepted boolean default false,
  created_at timestamptz default now() not null,
  unique(project_id, email)
);

alter table project_invites enable row level security;

-- Project owners can view invites for their projects
create policy "Owners can view project invites"
on project_invites for select
using (is_project_owner(project_id));

-- Project owners can send invites
create policy "Owners can create invites"
on project_invites for insert
with check (is_project_owner(project_id));

-- Project owners can update invites (for accept/revoke)
create policy "Owners can update invites"
on project_invites for update
using (is_project_owner(project_id));

-- Anyone can view invites sent to their email
create policy "Users can view own invites"
on project_invites for select
using (
  exists (
    select 1 from auth.users
    where auth.users.email = project_invites.email
      and auth.users.id = auth.uid()
  )
);

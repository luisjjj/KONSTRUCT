-- =============================================================================
-- Konstruct Construction Project Ledger - Database Schema
-- =============================================================================
-- This schema defines the complete database structure for the Konstruct app,
-- including tables, foreign keys, RLS policies, indexes, and triggers.
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with additional app-specific fields
-- =============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('owner', 'contractor', 'verifier')),
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table profiles enable row level security;

-- =============================================================================
-- 2. PROJECTS TABLE
-- Core project ledger with budget tracking
-- =============================================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  total_budget numeric not null default 0,
  spent_budget numeric default 0,
  funds_released numeric default 0,
  funds_locked numeric default 0,
  completion_percentage numeric default 0,
  status text default 'active' check (status in ('active', 'completed', 'on_hold', 'cancelled')),
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table projects enable row level security;

-- =============================================================================
-- 3. PROJECT_COLLABORATORS TABLE
-- Maps users to projects with roles (composite primary key)
-- =============================================================================
create table project_collaborators (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'contractor', 'verifier')),
  created_at timestamptz default now() not null,
  primary key (project_id, user_id)
);

alter table project_collaborators enable row level security;

-- =============================================================================
-- 4. PHASES TABLE
-- Project phases with budget allocation tracking
-- =============================================================================
create table phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'not_started' check (status in (
    'not_started', 'in_progress', 'submitted_for_review',
    'approved', 'completed', 'funded'
  )),
  budget_allocation numeric default 0,
  budget_spent numeric default 0,
  order_index integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table phases enable row level security;

-- =============================================================================
-- 5. MILESTONES TABLE
-- Trackable completion points within phases
-- =============================================================================
create table milestones (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  verified_by uuid references profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz default now() not null
);

alter table milestones enable row level security;

-- =============================================================================
-- 6. EVIDENCE TABLE
-- File-based proof attached to phases/milestones
-- =============================================================================
create table evidence (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade not null,
  milestone_id uuid references milestones(id) on delete set null,
  user_id uuid references profiles(id) on delete set null not null,
  type text not null check (type in ('photo', 'video', 'document')),
  file_url text not null,
  description text,
  created_at timestamptz default now() not null
);

alter table evidence enable row level security;

-- =============================================================================
-- 7. PAYMENTS TABLE
-- Payment ledger for project funds
-- =============================================================================
create table payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null not null,
  phase_id uuid references phases(id) on delete set null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'released', 'held')),
  payer_id uuid references profiles(id) on delete set null,
  payee_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  released_at timestamptz
);

alter table payments enable row level security;

-- =============================================================================
-- 8. DISPUTES TABLE
-- Conflict resolution tracking
-- =============================================================================
create table disputes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null not null,
  phase_id uuid references phases(id) on delete set null,
  raised_by uuid references profiles(id) on delete set null not null,
  title text not null,
  description text,
  status text default 'open' check (status in ('open', 'in_review', 'resolved', 'closed')),
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);

alter table disputes enable row level security;

-- =============================================================================
-- 9. DISPUTE_MESSAGES TABLE
-- Message thread for dispute resolution
-- =============================================================================
create table dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null not null,
  message text not null,
  created_at timestamptz default now() not null
);

alter table dispute_messages enable row level security;

-- =============================================================================
-- 10. ACTIVITIES TABLE
-- Audit log for all project actions
-- =============================================================================
create table activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null not null,
  user_id uuid references profiles(id) on delete set null not null,
  type text not null check (type in ('phase', 'payment', 'evidence', 'dispute', 'milestone')),
  action text not null,
  details text,
  created_at timestamptz default now() not null
);

alter table activities enable row level security;

-- =============================================================================
-- INDEXES
-- Optimize common query patterns
-- =============================================================================

-- Profiles
create index idx_profiles_role on profiles(role);

-- Projects
create index idx_projects_owner_id on projects(owner_id);
create index idx_projects_status on projects(status);

-- Project Collaborators
create index idx_project_collaborators_user_id on project_collaborators(user_id);
create index idx_project_collaborators_role on project_collaborators(role);

-- Phases
create index idx_phases_project_id on phases(project_id);
create index idx_phases_status on phases(status);

-- Milestones
create index idx_milestones_phase_id on milestones(phase_id);
create index idx_milestones_completed on milestones(completed);

-- Evidence
create index idx_evidence_phase_id on evidence(phase_id);
create index idx_evidence_milestone_id on evidence(milestone_id);
create index idx_evidence_user_id on evidence(user_id);

-- Payments
create index idx_payments_project_id on payments(project_id);
create index idx_payments_phase_id on payments(phase_id);
create index idx_payments_status on payments(status);
create index idx_payments_payer_id on payments(payer_id);
create index idx_payments_payee_id on payments(payee_id);

-- Disputes
create index idx_disputes_project_id on disputes(project_id);
create index idx_disputes_phase_id on disputes(phase_id);
create index idx_disputes_status on disputes(status);
create index idx_disputes_raised_by on disputes(raised_by);

-- Dispute Messages
create index idx_dispute_messages_dispute_id on dispute_messages(dispute_id);
create index idx_dispute_messages_user_id on dispute_messages(user_id);

-- Activities
create index idx_activities_project_id on activities(project_id);
create index idx_activities_user_id on activities(user_id);
create index idx_activities_type on activities(type);
create index idx_activities_created_at on activities(created_at desc);

-- =============================================================================
-- TRIGGER FUNCTIONS
-- =============================================================================

-- Auto-update `updated_at` timestamp on row update
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to all tables that have the column
create trigger set_updated_at_profiles
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger set_updated_at_projects
  before update on projects
  for each row execute function update_updated_at_column();

create trigger set_updated_at_phases
  before update on phases
  for each row execute function update_updated_at_column();

-- Auto-create profile when a new user signs up via Supabase Auth
-- Reads full_name and role from raw_user_meta_data if provided
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'contractor')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: fires after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Prevent role changes after signup (roles are immutable)
create or replace function prevent_role_change()
returns trigger as $$
begin
  if old.role is distinct from new.role then
    raise exception 'User role is immutable and cannot be changed after signup';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger prevent_profile_role_change
  before update on profiles
  for each row execute function prevent_role_change();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- Helper: check if current user is a collaborator on a given project
-- We use a stable function to avoid repeating subqueries in policies

create or replace function is_project_collaborator(p_project_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from project_collaborators
    where project_id = p_project_id
      and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create or replace function is_project_owner(p_project_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from project_collaborators
    where project_id = p_project_id
      and user_id = auth.uid()
      and role = 'owner'
  );
end;
$$ language plpgsql security definer stable;

-- -----------------------------------------------------------------------------
-- PROFILES policies
-- -----------------------------------------------------------------------------

-- Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid());

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Users can insert their own profile (handled by trigger, but safe to allow)
create policy "Users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

-- -----------------------------------------------------------------------------
-- PROJECTS policies
-- -----------------------------------------------------------------------------

-- Collaborators can view projects they belong to
create policy "Collaborators can view projects"
  on projects for select
  using (is_project_collaborator(id));

-- Any authenticated user can create a project
create policy "Authenticated users can create projects"
  on projects for insert
  to authenticated
  with check (true);

-- Owners can update their projects
create policy "Owners can update projects"
  on projects for update
  using (is_project_owner(id));

-- Owners can delete their projects
create policy "Owners can delete projects"
  on projects for delete
  using (is_project_owner(id));

-- -----------------------------------------------------------------------------
-- PROJECT_COLLABORATORS policies
-- -----------------------------------------------------------------------------

-- Collaborators can view collaborators on their projects
create policy "Collaborators can view project collaborators"
  on project_collaborators for select
  using (is_project_collaborator(project_id));

-- Project owners can add collaborators
create policy "Owners can add collaborators"
  on project_collaborators for insert
  with check (is_project_owner(project_id));

-- Project owners can update collaborator roles
create policy "Owners can update collaborators"
  on project_collaborators for update
  using (is_project_owner(project_id));

-- Project owners can remove collaborators
create policy "Owners can delete collaborators"
  on project_collaborators for delete
  using (is_project_owner(project_id));

-- -----------------------------------------------------------------------------
-- PHASES policies
-- -----------------------------------------------------------------------------

-- Collaborators can view phases of their projects
create policy "Collaborators can view phases"
  on phases for select
  using (is_project_collaborator(project_id));

-- Owners can create phases
create policy "Owners can create phases"
  on phases for insert
  with check (is_project_owner(project_id));

-- Owners can update phases
create policy "Owners can update phases"
  on phases for update
  using (is_project_owner(project_id));

-- Owners can delete phases
create policy "Owners can delete phases"
  on phases for delete
  using (is_project_owner(project_id));

-- -----------------------------------------------------------------------------
-- MILESTONES policies
-- -----------------------------------------------------------------------------

-- Collaborators can view milestones through their project access
create policy "Collaborators can view milestones"
  on milestones for select
  using (
    exists (
      select 1 from phases
      where phases.id = milestones.phase_id
        and is_project_collaborator(phases.project_id)
    )
  );

-- Owners can create milestones
create policy "Owners can create milestones"
  on milestones for insert
  with check (
    exists (
      select 1 from phases
      where phases.id = phase_id
        and is_project_owner(phases.project_id)
    )
  );

-- Owners can update milestones
create policy "Owners can update milestones"
  on milestones for update
  using (
    exists (
      select 1 from phases
      where phases.id = phase_id
        and is_project_owner(phases.project_id)
    )
  );

-- Owners can delete milestones
create policy "Owners can delete milestones"
  on milestones for delete
  using (
    exists (
      select 1 from phases
      where phases.id = phase_id
        and is_project_owner(phases.project_id)
    )
  );

-- -----------------------------------------------------------------------------
-- EVIDENCE policies
-- -----------------------------------------------------------------------------

-- Collaborators can view evidence on their projects
create policy "Collaborators can view evidence"
  on evidence for select
  using (
    exists (
      select 1 from phases
      where phases.id = evidence.phase_id
        and is_project_collaborator(phases.project_id)
    )
  );

-- Collaborators can upload evidence to their projects
create policy "Collaborators can upload evidence"
  on evidence for insert
  with check (
    exists (
      select 1 from phases
      where phases.id = phase_id
        and is_project_collaborator(phases.project_id)
    )
  );

-- Users can update their own evidence
create policy "Users can update own evidence"
  on evidence for update
  using (user_id = auth.uid());

-- Users can delete their own evidence
create policy "Users can delete own evidence"
  on evidence for delete
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- PAYMENTS policies
-- -----------------------------------------------------------------------------

-- Collaborators can view payments on their projects
create policy "Collaborators can view payments"
  on payments for select
  using (is_project_collaborator(project_id));

-- Owners can create payments
create policy "Owners can create payments"
  on payments for insert
  with check (is_project_owner(project_id));

-- Owners can update payments
create policy "Owners can update payments"
  on payments for update
  using (is_project_owner(project_id));

-- Owners can delete payments
create policy "Owners can delete payments"
  on payments for delete
  using (is_project_owner(project_id));

-- -----------------------------------------------------------------------------
-- DISPUTES policies
-- -----------------------------------------------------------------------------

-- Collaborators can view disputes on their projects
create policy "Collaborators can view disputes"
  on disputes for select
  using (is_project_collaborator(project_id));

-- Collaborators can raise disputes
create policy "Collaborators can raise disputes"
  on disputes for insert
  with check (is_project_collaborator(project_id));

-- Collaborators can update disputes (for resolution workflow)
create policy "Collaborators can update disputes"
  on disputes for update
  using (is_project_collaborator(project_id));

-- Users who raised disputes can delete them while open
create policy "Users can delete own open disputes"
  on disputes for delete
  using (raised_by = auth.uid() and status = 'open');

-- -----------------------------------------------------------------------------
-- DISPUTE_MESSAGES policies
-- -----------------------------------------------------------------------------

-- Collaborators can view messages on project disputes
create policy "Collaborators can view dispute messages"
  on dispute_messages for select
  using (
    exists (
      select 1 from disputes
      where disputes.id = dispute_messages.dispute_id
        and is_project_collaborator(disputes.project_id)
    )
  );

-- Collaborators can send messages on project disputes
create policy "Collaborators can send dispute messages"
  on dispute_messages for insert
  with check (
    exists (
      select 1 from disputes
      where disputes.id = dispute_id
        and is_project_collaborator(disputes.project_id)
    )
  );

-- Users can update their own messages
create policy "Users can update own dispute messages"
  on dispute_messages for update
  using (user_id = auth.uid());

-- Users can delete their own messages
create policy "Users can delete own dispute messages"
  on dispute_messages for delete
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- ACTIVITIES policies
-- -----------------------------------------------------------------------------

-- Collaborators can view activities on their projects
create policy "Collaborators can view activities"
  on activities for select
  using (is_project_collaborator(project_id));

-- System and authenticated users can log activities
create policy "Authenticated users can log activities"
  on activities for insert
  to authenticated
  with check (true);

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

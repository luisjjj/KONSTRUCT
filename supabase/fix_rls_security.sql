-- =============================================================================
-- Security Fixes — RLS Policies
-- =============================================================================
-- 1. Fix collaborator insert: remove self-add vulnerability
-- 2. Ensure only project owners can add collaborators
-- =============================================================================

-- Drop the vulnerable policy
drop policy if exists "Owners can add collaborators" on project_collaborators;

-- Recreate with strict owner-only check (no self-add backdoor)
create policy "Owners can add collaborators"
  on project_collaborators for insert
  with check (is_project_owner(project_id));

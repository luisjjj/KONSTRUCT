-- Function to update user role based on subscription (bypasses immutability trigger)
-- Uses SECURITY DEFINER so it runs as the function owner, not the calling user
create or replace function update_user_role_for_subscription(
  p_user_id uuid,
  p_plan_name text
)
returns void as $$
begin
  -- Temporarily disable the role immutability trigger
  alter table profiles disable trigger prevent_profile_role_change;

  -- Update the role
  update profiles
  set role = case
    when p_plan_name = 'enterprise' then 'owner'
    when p_plan_name = 'professional' then 'contractor'
    else role
  end
  where id = p_user_id;

  -- Re-enable the trigger
  alter table profiles enable trigger prevent_profile_role_change;
end;
$$ language plpgsql security definer;

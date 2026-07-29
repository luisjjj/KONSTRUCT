-- Function to update user role based on subscription
-- Drops and recreates the immutability trigger to allow the update
create or replace function update_user_role_for_subscription(
  p_user_id uuid,
  p_plan_name text
)
returns void as $$
begin
  -- Drop the immutability trigger
  drop trigger if exists prevent_profile_role_change on profiles;

  -- Update the role
  update profiles
  set role = case
    when p_plan_name = 'enterprise' then 'owner'
    when p_plan_name = 'professional' then 'contractor'
    else role
  end
  where id = p_user_id;

  -- Recreate the immutability trigger
  create trigger prevent_profile_role_change
    before update on profiles
    for each row execute function prevent_role_change();
end;
$$ language plpgsql security definer;

create or replace function release_funds(p_project_id uuid, p_amount numeric)
returns void as $$
begin
  update projects set
    funds_released = funds_released + p_amount,
    funds_locked = funds_locked - p_amount,
    updated_at = now()
  where id = p_project_id;
end;
$$ language plpgsql security definer;

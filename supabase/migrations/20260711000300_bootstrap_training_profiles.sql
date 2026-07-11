-- Create a least-privilege learner profile whenever Supabase Auth creates a user.
-- The trigger function is kept outside the exposed Data API schemas.
create schema if not exists training_private;

create or replace function training_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = training_private, pg_catalog
as $$
begin
  insert into training.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on schema training_private from public, anon, authenticated;
revoke all on function training_private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_training_profile on auth.users;
create trigger on_auth_user_created_training_profile
  after insert on auth.users
  for each row execute procedure training_private.handle_new_user();

create policy "profiles: users create own learner profile" on training.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'learner');

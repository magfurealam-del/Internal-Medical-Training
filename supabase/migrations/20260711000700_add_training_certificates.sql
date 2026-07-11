create table training.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique default ('EKG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references training.courses(id) on delete cascade,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table training.certificates enable row level security;
grant select on training.certificates to authenticated;

create policy "certificates: users read own certificates" on training.certificates
  for select to authenticated using (user_id = (select auth.uid()) or training.is_instructor());
create or replace function training.issue_certificate(p_attempt_id uuid)
returns uuid
language plpgsql
security definer
set search_path = training, pg_catalog
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_id uuid;
  v_certificate_id uuid;
begin
  select q.course_id into v_course_id
  from training.attempts a join training.quizzes q on q.id = a.quiz_id
  where a.id = p_attempt_id and a.user_id = v_user_id and a.passed = true;
  if v_course_id is null then raise exception 'Passed attempt not found'; end if;
  insert into training.certificates (user_id, course_id)
  values (v_user_id, v_course_id)
  on conflict (user_id, course_id) do update set issued_at = training.certificates.issued_at
  returning id into v_certificate_id;
  return v_certificate_id;
end;
$$;

revoke all on function training.issue_certificate(uuid) from public, anon;
grant execute on function training.issue_certificate(uuid) to authenticated;

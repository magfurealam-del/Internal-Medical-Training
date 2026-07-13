-- When a certificate is issued, mark the enrollment as completed.
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

  -- Mark enrollment complete
  update training.enrollments
  set status = 'completed', completed_at = coalesce(completed_at, now())
  where user_id = v_user_id and course_id = v_course_id;

  return v_certificate_id;
end;
$$;

-- Allow admins to reset a learner's progress for a course
create or replace function training.reset_learner_progress(p_user_id uuid, p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = training, pg_catalog
as $$
begin
  -- Only administrators/instructors may call this
  if not training.is_instructor() then
    raise exception 'Permission denied';
  end if;

  -- Delete lesson progress for lessons in this course
  delete from training.lesson_progress
  where user_id = p_user_id
    and lesson_id in (
      select l.id from training.lessons l
      join training.modules m on m.id = l.module_id
      where m.course_id = p_course_id
    );

  -- Delete attempt answers, then attempts for quizzes in this course
  delete from training.attempt_answers
  where attempt_id in (
    select a.id from training.attempts a
    join training.quizzes q on q.id = a.quiz_id
    where a.user_id = p_user_id and q.course_id = p_course_id
  );

  delete from training.attempts
  where user_id = p_user_id
    and quiz_id in (select id from training.quizzes where course_id = p_course_id);

  -- Delete certificate
  delete from training.certificates
  where user_id = p_user_id and course_id = p_course_id;

  -- Reset enrollment to active
  update training.enrollments
  set status = 'active', completed_at = null
  where user_id = p_user_id and course_id = p_course_id;
end;
$$;

revoke all on function training.reset_learner_progress(uuid, uuid) from public, anon;
grant execute on function training.reset_learner_progress(uuid, uuid) to authenticated;

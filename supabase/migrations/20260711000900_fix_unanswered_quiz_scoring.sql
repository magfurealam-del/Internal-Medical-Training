create or replace function training.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = training, pg_catalog
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_attempt_id uuid;
  v_total integer;
  v_correct integer;
  v_score integer;
  v_passed boolean;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from training.enrollments e join training.quizzes q on q.course_id = e.course_id where q.id = p_quiz_id and e.user_id = v_user_id and e.status in ('active', 'completed')) then
    raise exception 'Not enrolled in this quiz';
  end if;

  select count(*) into v_total from training.questions where quiz_id = p_quiz_id;
  if v_total = 0 then raise exception 'Quiz has no questions'; end if;

  insert into training.attempts (quiz_id, user_id) values (p_quiz_id, v_user_id) returning id into v_attempt_id;

  insert into training.attempt_answers (attempt_id, question_id, selected_choice_id, is_correct)
  select v_attempt_id, q.id,
    case when answer.choice_id is null or answer.choice_id = '' then null else answer.choice_id::uuid end,
    coalesce(answer.choice_id is not null and answer.choice_id <> '' and answer.choice_id::uuid = q.correct_choice_id, false)
  from training.questions q
  left join lateral jsonb_to_recordset(coalesce(p_answers, '[]'::jsonb)) as answer(question_id text, choice_id text) on answer.question_id = q.id::text
  where q.quiz_id = p_quiz_id;

  select count(*) filter (where is_correct) into v_correct from training.attempt_answers where attempt_id = v_attempt_id;
  v_score := round((v_correct::numeric / v_total::numeric) * 100);
  select v_score >= pass_percentage into v_passed from training.quizzes where id = p_quiz_id;
  update training.attempts set score_percentage = v_score, passed = v_passed where id = v_attempt_id;
  return jsonb_build_object('attempt_id', v_attempt_id, 'score_percentage', v_score, 'passed', v_passed);
end;
$$;

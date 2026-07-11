create type training.question_type as enum ('single_choice', 'true_false');

create table training.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references training.courses(id) on delete cascade,
  module_id uuid references training.modules(id) on delete cascade,
  title text not null,
  description text,
  pass_percentage integer not null default 70 check (pass_percentage between 0 and 100),
  attempt_limit integer check (attempt_limit is null or attempt_limit > 0),
  created_at timestamptz not null default now()
);

create table training.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references training.quizzes(id) on delete cascade,
  prompt text not null,
  question_type training.question_type not null default 'single_choice',
  sort_order integer not null default 0,
  explanation text,
  correct_choice_id uuid,
  unique (quiz_id, sort_order)
);

create table training.question_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references training.questions(id) on delete cascade,
  choice_text text not null,
  sort_order integer not null default 0,
  unique (question_id, sort_order)
);

alter table training.questions
  add constraint questions_correct_choice_fk
  foreign key (correct_choice_id) references training.question_choices(id) on delete set null;

create table training.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references training.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score_percentage integer not null default 0 check (score_percentage between 0 and 100),
  passed boolean not null default false,
  submitted_at timestamptz not null default now()
);

create table training.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references training.attempts(id) on delete cascade,
  question_id uuid not null references training.questions(id) on delete cascade,
  selected_choice_id uuid references training.question_choices(id) on delete set null,
  is_correct boolean not null default false,
  unique (attempt_id, question_id)
);

create view training.quiz_items_public with (security_invoker = true) as
  select q.id as question_id, q.quiz_id, q.prompt, q.question_type, q.sort_order,
         c.id as choice_id, c.choice_text, c.sort_order as choice_sort_order
  from training.questions q
  join training.question_choices c on c.question_id = q.id;

grant select on training.quiz_items_public to authenticated;
grant select, insert on training.attempts to authenticated;
grant select, insert on training.attempt_answers to authenticated;

alter table training.quizzes enable row level security;
alter table training.questions enable row level security;
alter table training.question_choices enable row level security;
alter table training.attempts enable row level security;
alter table training.attempt_answers enable row level security;

create policy "quizzes: enrolled users read quizzes" on training.quizzes
  for select to authenticated using (exists (
    select 1 from training.enrollments e
    where e.course_id = quizzes.course_id and e.user_id = (select auth.uid())
      and e.status in ('active', 'completed')
  ));
create policy "questions: enrolled users read public quiz items" on training.questions
  for select to authenticated using (exists (
    select 1 from training.quizzes q join training.enrollments e on e.course_id = q.course_id
    where q.id = questions.quiz_id and e.user_id = (select auth.uid())
      and e.status in ('active', 'completed')
  ));
create policy "choices: enrolled users read quiz choices" on training.question_choices
  for select to authenticated using (exists (
    select 1 from training.questions q join training.quizzes z on z.id = q.quiz_id
    join training.enrollments e on e.course_id = z.course_id
    where q.id = question_choices.question_id and e.user_id = (select auth.uid())
      and e.status in ('active', 'completed')
  ));
create policy "attempts: users read own attempts" on training.attempts
  for select to authenticated using (user_id = (select auth.uid()) or training.is_instructor());
create policy "attempt answers: users read own answers" on training.attempt_answers
  for select to authenticated using (exists (
    select 1 from training.attempts a where a.id = attempt_answers.attempt_id
      and (a.user_id = (select auth.uid()) or training.is_instructor())
  ));

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
  select v_attempt_id, q.id, answer.choice_id::uuid, answer.choice_id::uuid = q.correct_choice_id
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

revoke all on function training.submit_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function training.submit_quiz_attempt(uuid, jsonb) to authenticated;

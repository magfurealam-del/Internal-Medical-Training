with selected_course as (
  select id from training.courses where slug = 'clinical-team-essentials'
), selected_module as (
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 1 limit 1
), new_quiz as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select course_id, id, 'Getting Started Check', 'A short check of the pilot orientation lesson.', 70
  from selected_module
  on conflict do nothing
  returning id, course_id
), selected_quiz as (
  select id, course_id from new_quiz
  union all
  select q.id, q.course_id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Getting Started Check' limit 1
), new_question as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Where is the canonical lesson material maintained?', 'single_choice', 1, 'Lesson material is reviewed and versioned in GitHub.'
  from selected_quiz
  on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt
  returning id, quiz_id
), selected_question as (
  select id, quiz_id from new_question
  union all
  select q.id, q.quiz_id from training.questions q join selected_quiz z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), choices as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, choice_text, sort_order from selected_question cross join (values ('GitHub', 1), ('A personal email inbox', 2), ('A public spreadsheet', 3)) as v(choice_text, sort_order)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text
  returning id, question_id, sort_order
)
update training.questions q
set correct_choice_id = c.id
from choices c
where q.id = c.question_id and c.sort_order = 1;

update training.courses set status = 'published' where slug = 'clinical-team-essentials';

insert into training.enrollments (user_id, course_id, status)
select u.id, c.id, 'active'
from auth.users u cross join training.courses c
where lower(u.email) = lower('Magfur@ekagrahospital.com') and c.slug = 'clinical-team-essentials'
on conflict (user_id, course_id) do update set status = 'active';

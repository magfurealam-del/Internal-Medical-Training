-- Pilot content for Course 1: Foundations of Wound Care.
-- Seeds Module 1, Lesson 1 ("Mechanism-First Wound Care: How This Bible Works")
-- plus a matching single-choice quiz. Course is left in 'draft' status pending
-- clinical review before publishing/enrollment (see Module 1 governance note).

with new_course as (
  insert into training.courses (title, slug, description, status, content_version)
  values (
    'Foundations of Wound Care',
    'foundations-of-wound-care',
    'Course 1 of 4: skin anatomy, wound healing biology, classification, whole-patient assessment, documentation, and core clinical frameworks (VIP, TIME, MOIST, Wound Balance, Triangle).',
    'draft',
    '0.1.0'
  )
  on conflict (slug) do update set description = excluded.description
  returning id
), selected_course as (
  select id from new_course
  union all
  select id from training.courses where slug = 'foundations-of-wound-care'
  limit 1
), new_module as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Mechanism-Based Wound Care System', 'How this training Bible is structured: barrier -> science -> assessment -> therapy -> contraindication -> monitoring.', 1
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), selected_module as (
  select id, course_id from new_module
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 1
  limit 1
), new_lesson as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Mechanism-First Wound Care: How This Bible Works', 'how-this-bible-works',
    'courses/foundations-of-wound-care/module-01/lesson-01.md', 1, true
  from selected_module
  on conflict (module_id, slug) do update set content_path = excluded.content_path, is_required = excluded.is_required
  returning id, module_id
), selected_lesson as (
  select id, module_id from new_lesson
  union all
  select l.id, l.module_id from training.lessons l join selected_module m on m.id = l.module_id where l.slug = 'how-this-bible-works'
  limit 1

-- Quiz: Module 1, Lesson 1 check
), new_quiz as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Mechanism-First Wound Care: Knowledge Check',
    'Checks understanding of the mechanism-first training sequence and the Master Barrier-to-Therapy Map from Module 1.', 80
  from selected_course sc cross join selected_module sm
  on conflict do nothing
  returning id, course_id
), selected_quiz as (
  select id, course_id from new_quiz
  union all
  select q.id, q.course_id from training.quizzes q join selected_course c on c.id = q.course_id
    where q.title = 'Mechanism-First Wound Care: Knowledge Check'
  limit 1

-- Question 1: mechanism-first sequencing
), q1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id,
    'A patient''s wound has failed to improve over several weeks. Per Module 1''s mechanism-first approach, what must happen before selecting an advanced therapy or device?',
    'single_choice', 1,
    'Module 1''s core training sentence is "mechanism first, product second, measurement always" -- the underlying biological barrier must be identified before any therapy or device is chosen.'
  from selected_quiz
  on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt, explanation = excluded.explanation
  returning id, quiz_id
), selected_q1 as (
  select id, quiz_id from q1
  union all
  select q.id, q.quiz_id from training.questions q join selected_quiz z on z.id = q.quiz_id where q.sort_order = 1
  limit 1
), q1_choices as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, choice_text, sort_order from selected_q1 cross join (values
    ('The underlying biological barrier must be identified and defined', 1),
    ('A dressing should be selected based on what is currently in stock', 2),
    ('The most advanced device available should be started regardless of findings', 3),
    ('Bedside-manner and communication scripting should be reviewed first', 4)
  ) as v(choice_text, sort_order)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text
  returning id, question_id, sort_order
), q1_update as (
  update training.questions q
  set correct_choice_id = c.id
  from q1_choices c
  where q.id = c.question_id and c.sort_order = 1
  returning q.id

-- Question 2: Master Barrier-to-Therapy Map application
), q2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id,
    'A patient has cool toes, weak pulses, and an ischemic-looking wound color. Per the Master Barrier-to-Therapy Map, which barrier does this represent, and what is the correct diagnostic focus?',
    'single_choice', 2,
    'This presentation maps to poor perfusion. The diagnostic focus is pulse exam, capillary refill, and limb temperature comparison, leading to vascular referral and revascularization planning.'
  from selected_quiz
  on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt, explanation = excluded.explanation
  returning id, quiz_id
), selected_q2 as (
  select id, quiz_id from q2
  union all
  select q.id, q.quiz_id from training.questions q join selected_quiz z on z.id = q.quiz_id where q.sort_order = 2
  limit 1
), q2_choices as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, choice_text, sort_order from selected_q2 cross join (values
    ('Poor perfusion; pulse exam, capillary refill, and limb temperature comparison', 1),
    ('Moisture imbalance; assess exudate amount, color, and dressing wear time', 2),
    ('Neuropathy and loss of protective sensation; monofilament or vibration screening', 3),
    ('Wound edge failure; assess undermining depth and callus source', 4)
  ) as v(choice_text, sort_order)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text
  returning id, question_id, sort_order
), q2_update as (
  update training.questions q
  set correct_choice_id = c.id
  from q2_choices c
  where q.id = c.question_id and c.sort_order = 1
  returning q.id

-- Question 3: doctor/nurse role expectation
), q3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id,
    'During a dressing change, a nurse observes new odor and increasing exudate. Per Module 1''s nurse knowledge expectations, what is the most appropriate immediate action?',
    'single_choice', 3,
    'Module 1 states nurses should document wound measurements and tissue changes consistently and alert the physician when red flags or non-healing patterns appear -- not act on advanced therapy independently.'
  from selected_quiz
  on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt, explanation = excluded.explanation
  returning id, quiz_id
), selected_q3 as (
  select id, quiz_id from q3
  union all
  select q.id, q.quiz_id from training.questions q join selected_quiz z on z.id = q.quiz_id where q.sort_order = 3
  limit 1
), q3_choices as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, choice_text, sort_order from selected_q3 cross join (values
    ('Document the finding and alert the physician per the red-flag escalation expectation', 1),
    ('Independently start an antimicrobial dressing without notifying the physician', 2),
    ('Take no action, since moisture changes are rarely clinically relevant', 3),
    ('Refer the patient directly for surgery without physician involvement', 4)
  ) as v(choice_text, sort_order)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text
  returning id, question_id, sort_order
)
update training.questions q
set correct_choice_id = c.id
from q3_choices c
where q.id = c.question_id and c.sort_order = 1;

-- Course 1 / Module 1 content seed and public read-only course access.

with selected_course as (
  select id from training.courses where slug = 'clinical-team-essentials' limit 1
), selected_module as (
  insert into training.modules (course_id, title, description, sort_order)
  select id,
    'Module 1: Mechanism-Based Wound Care System',
    'Build the shared Ekagra reasoning sequence: finding, mechanism, assessment, match, cautions, monitoring, and documentation.',
    1
  from selected_course
  on conflict (course_id, sort_order) do update set title = excluded.title, description = excluded.description
  returning id
)
delete from training.lessons
where module_id in (select id from selected_module);

with selected_course as (
  select id from training.courses where slug = 'clinical-team-essentials' limit 1
), selected_module as (
  select m.id
  from training.modules m join selected_course c on c.id = m.course_id
  where m.sort_order = 1
)
insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
select id, lesson.title, lesson.slug, lesson.content_path, lesson.sort_order, true
from selected_module
cross join (values
  ('Module 1: Mechanism-Based Wound Care System', 'module-1-overview', 'courses/clinical-team-essentials/module-01/lesson-01.md', 1),
  ('Mechanism Before Product', 'mechanism-before-product', 'courses/clinical-team-essentials/module-01/lesson-02.md', 2),
  ('When a Wound Stalls', 'when-a-wound-stalls', 'courses/clinical-team-essentials/module-01/lesson-03.md', 3),
  ('Healing Potential and Standard Care', 'healing-potential-standard-care', 'courses/clinical-team-essentials/module-01/lesson-04.md', 4),
  ('VIP, TIME, and MOIST', 'vip-time-moist', 'courses/clinical-team-essentials/module-01/lesson-05.md', 5),
  ('Evidence, Uncertainty, and Safe Reasoning', 'evidence-and-uncertainty', 'courses/clinical-team-essentials/module-01/lesson-06.md', 6),
  ('Recognizing Barriers Without Jumping Ahead', 'barrier-recognition-boundaries', 'courses/clinical-team-essentials/module-01/lesson-07.md', 7),
  ('Integrated Case and Documentation', 'integrated-case-documentation', 'courses/clinical-team-essentials/module-01/lesson-08.md', 8)
) as lesson(title, slug, content_path, sort_order);

update training.courses
set title = 'Course 1: Foundations — Clinical Reasoning',
    description = 'A foundational clinical-reasoning course for Ekagra Health doctors and nurses: skin, healing biology, wound classification, whole-patient assessment, documentation, and shared clinical frameworks.',
    status = 'published',
    content_version = '1.1.0'
where slug = 'clinical-team-essentials';

grant usage on schema training to anon;
grant select on training.courses, training.modules, training.lessons to anon;

create policy "public: read published courses" on training.courses
  for select to anon using (status = 'published');

create policy "public: read published modules" on training.modules
  for select to anon using (exists (
    select 1 from training.courses c where c.id = modules.course_id and c.status = 'published'
  ));

create policy "public: read published lessons" on training.lessons
  for select to anon using (exists (
    select 1 from training.modules m join training.courses c on c.id = m.course_id
    where m.id = lessons.module_id and c.status = 'published'
  ));

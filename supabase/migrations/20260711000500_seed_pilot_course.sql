with new_course as (
  insert into training.courses (title, slug, description, status, content_version)
  values (
    'Clinical Team Essentials',
    'clinical-team-essentials',
    'Starter pilot course for validating the medical team training workflow.',
    'draft',
    '0.1.0'
  )
  on conflict (slug) do update set description = excluded.description
  returning id
), selected_course as (
  select id from new_course
  union all
  select id from training.courses where slug = 'clinical-team-essentials'
  limit 1
), new_module as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Getting started', 'Orientation for the medical team training platform.', 1
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), selected_module as (
  select id, course_id from new_module
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 1
  limit 1
)
insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
select id, 'Welcome to Clinical Team Essentials', 'welcome', 'courses/clinical-team-essentials/module-01/lesson-01.md', 1, true
from selected_module
on conflict (module_id, slug) do update set content_path = excluded.content_path, is_required = excluded.is_required;

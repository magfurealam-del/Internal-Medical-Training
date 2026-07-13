update training.quizzes
set title = 'Module 1 Final Quiz',
    description = 'Comprehensive 20-question assessment covering skin anatomy, barrier physiology, dermal repair, subcutaneous tissue, vulnerability, wound depth, mechanisms, and documentation.',
    pass_percentage = 80,
    attempt_limit = 2
where module_id in (
  select m.id from training.modules m
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 1
);

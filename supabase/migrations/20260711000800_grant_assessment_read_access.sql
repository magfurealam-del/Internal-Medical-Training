-- The public quiz view uses security_invoker, so authenticated users need
-- table SELECT privileges in addition to the RLS policies on these tables.
grant select on training.quizzes to authenticated;
grant select on training.questions to authenticated;
grant select on training.question_choices to authenticated;

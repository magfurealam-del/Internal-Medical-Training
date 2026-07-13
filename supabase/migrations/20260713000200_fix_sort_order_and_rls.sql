-- Fix 1: Drop unique constraints on sort_order columns so adjacent-swap reorder works.
-- sort_order is an ordering hint, not a business key — duplicates are harmless.
alter table training.modules drop constraint if exists modules_course_id_sort_order_key;
alter table training.lessons drop constraint if exists lessons_module_id_sort_order_key;
alter table training.questions drop constraint if exists questions_quiz_id_sort_order_key;

-- Fix 2: Add sort_order to quizzes (was missing from original schema).
alter table training.quizzes add column if not exists sort_order integer not null default 0;

-- Fix 3: Broaden profiles read policy so instructors can also read all learner profiles.
-- Previously only admins could; this broke progress reports and enrollment forms for instructors.
drop policy if exists "profiles: users read own profile" on training.profiles;
create policy "profiles: users read own profile" on training.profiles
  for select to authenticated
  using (id = (select auth.uid()) or training.is_instructor());

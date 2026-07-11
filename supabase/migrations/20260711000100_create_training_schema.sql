-- Training platform boundary
-- All application tables for this product live in the `training` schema.
-- Existing call-center and finance tables are intentionally left untouched.

create schema if not exists training;

grant usage on schema training to authenticated;

create type training.user_role as enum ('learner', 'instructor', 'administrator');
create type training.enrollment_status as enum ('active', 'completed', 'expired', 'revoked');

create table training.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role training.user_role not null default 'learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table training.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  content_version text not null default '1.0.0',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table training.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references training.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  prerequisite_module_id uuid references training.modules(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table training.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references training.modules(id) on delete cascade,
  title text not null,
  slug text not null,
  content_path text not null,
  sort_order integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  unique (module_id, slug),
  unique (module_id, sort_order)
);

create table training.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references training.courses(id) on delete cascade,
  status training.enrollment_status not null default 'active',
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table training.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references training.lessons(id) on delete cascade,
  completed_at timestamptz,
  last_viewed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index enrollments_user_id_idx on training.enrollments(user_id);
create index enrollments_course_id_idx on training.enrollments(course_id);
create index modules_course_id_idx on training.modules(course_id);
create index lessons_module_id_idx on training.lessons(module_id);
create index lesson_progress_user_id_idx on training.lesson_progress(user_id);

grant select, insert, update, delete on all tables in schema training to authenticated;

create or replace function training.is_admin()
returns boolean
language sql
stable
security invoker
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'administrator';
$$;

create or replace function training.is_instructor()
returns boolean
language sql
stable
security invoker
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') in ('instructor', 'administrator');
$$;

alter table training.profiles enable row level security;
alter table training.courses enable row level security;
alter table training.modules enable row level security;
alter table training.lessons enable row level security;
alter table training.enrollments enable row level security;
alter table training.lesson_progress enable row level security;

create policy "profiles: users read own profile" on training.profiles
  for select to authenticated using (id = (select auth.uid()) or training.is_admin());
create policy "profiles: admins manage profiles" on training.profiles
  for all to authenticated using (training.is_admin()) with check (training.is_admin());

create policy "courses: enrolled users read published courses" on training.courses
  for select to authenticated using (
    status = 'published' and exists (
      select 1 from training.enrollments e
      where e.course_id = courses.id and e.user_id = (select auth.uid())
        and e.status in ('active', 'completed')
    )
  );
create policy "courses: instructors manage courses" on training.courses
  for all to authenticated using (training.is_instructor()) with check (training.is_instructor());

create policy "modules: enrolled users read modules" on training.modules
  for select to authenticated using (exists (
    select 1 from training.enrollments e join training.courses c on c.id = modules.course_id
    where e.course_id = modules.course_id and e.user_id = (select auth.uid())
      and e.status in ('active', 'completed') and c.status = 'published'
  ));
create policy "modules: instructors manage modules" on training.modules
  for all to authenticated using (training.is_instructor()) with check (training.is_instructor());

create policy "lessons: enrolled users read lessons" on training.lessons
  for select to authenticated using (exists (
    select 1 from training.enrollments e
    join training.modules m on m.id = lessons.module_id
    join training.courses c on c.id = m.course_id
    where e.course_id = m.course_id and e.user_id = (select auth.uid())
      and e.status in ('active', 'completed') and c.status = 'published'
  ));
create policy "lessons: instructors manage lessons" on training.lessons
  for all to authenticated using (training.is_instructor()) with check (training.is_instructor());

create policy "enrollments: users read own enrollments" on training.enrollments
  for select to authenticated using (user_id = (select auth.uid()) or training.is_instructor());
create policy "enrollments: instructors manage enrollments" on training.enrollments
  for all to authenticated using (training.is_instructor()) with check (training.is_instructor());

create policy "progress: users manage own progress" on training.lesson_progress
  for all to authenticated
  using (user_id = (select auth.uid()) or training.is_instructor())
  with check (user_id = (select auth.uid()) or training.is_instructor());

-- The Data API must expose `training` explicitly in Supabase dashboard settings.
-- Table access is still restricted by the RLS policies above.

create table training.audience_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table training.course_audience_groups (
  course_id uuid not null references training.courses(id) on delete cascade,
  audience_group_id uuid not null references training.audience_groups(id) on delete cascade,
  primary key (course_id, audience_group_id)
);

create index course_audience_groups_group_id_idx on training.course_audience_groups(audience_group_id);
alter table training.audience_groups enable row level security;
alter table training.course_audience_groups enable row level security;
grant select on training.audience_groups to authenticated;
grant select on training.course_audience_groups to authenticated;
grant insert, update, delete on training.audience_groups to authenticated;
grant insert, update, delete on training.course_audience_groups to authenticated;

create policy "audience groups: authenticated users read" on training.audience_groups
  for select to authenticated using (true);
create policy "audience groups: instructors manage" on training.audience_groups
  for all to authenticated using (training.is_instructor()) with check (training.is_instructor());
create policy "course audience groups: authenticated users read published assignments" on training.course_audience_groups
  for select to authenticated using (exists (select 1 from training.courses c where c.id = course_audience_groups.course_id and c.status = 'published') or training.is_instructor());
create policy "course audience groups: instructors manage" on training.course_audience_groups
  for all to authenticated using (training.is_instructor()) with check (training.is_instructor());

insert into training.audience_groups (name, slug, description) values
  ('Internal medical team', 'internal-medical-team', 'Clinical staff working within Ekagra Hospital.'),
  ('Nurses', 'nurses', 'Nursing and wound-care staff.'),
  ('Doctors', 'doctors', 'Doctors and clinical leaders.'),
  ('Administrative staff', 'administrative-staff', 'Administrative and operational staff.'),
  ('External partners', 'external-partners', 'External training partners and collaborators.')
on conflict (slug) do nothing;

insert into training.course_audience_groups (course_id, audience_group_id)
select c.id, g.id from training.courses c cross join training.audience_groups g
where c.slug = 'clinical-team-essentials' and g.slug = 'internal-medical-team'
on conflict do nothing;

-- Allow the public-preview catalogue to read only published training rows.
grant usage on schema training to anon;
grant select on training.courses, training.modules, training.lessons to anon;

-- Authenticated learners need the same catalogue read access when sign-in returns.
grant usage on schema training to authenticated;
grant select on training.courses, training.modules, training.lessons to authenticated;

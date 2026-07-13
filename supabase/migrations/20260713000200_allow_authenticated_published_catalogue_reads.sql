-- Public preview remains readable when a stale/authenticated session is present.
create policy "authenticated: read published courses"
  on training.courses
  for select to authenticated
  using (status = 'published');

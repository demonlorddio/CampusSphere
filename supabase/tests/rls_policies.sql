-- CampusSphere RLS policy tests (pgTAP / Supabase CLI)
--
-- These fixtures are synthetic, are created inside this transaction, and are
-- rolled back at the end. They are not application seed data. The test runner
-- must provide the Supabase auth schema and the authenticated role.
--
-- Run, when a local Supabase project is configured:
--   supabase test db

begin;

select plan(14);

-- Fixture setup intentionally runs as the database owner so the test can
-- establish identities and memberships before switching to authenticated.
set local role postgres;

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000101', 'campus-admin-a@example.invalid'),
  ('00000000-0000-0000-0000-000000000102', 'campus-leader-a@example.invalid'),
  ('00000000-0000-0000-0000-000000000103', 'campus-student-a@example.invalid'),
  ('00000000-0000-0000-0000-000000000201', 'campus-admin-b@example.invalid'),
  ('00000000-0000-0000-0000-000000000202', 'campus-student-b@example.invalid')
on conflict (id) do nothing;

insert into public.colleges (id, slug, name)
values
  ('00000000-0000-0000-0000-000000000001', 'north-campus', 'Synthetic North Campus'),
  ('00000000-0000-0000-0000-000000000002', 'south-campus', 'Synthetic South Campus')
on conflict (id) do nothing;

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-000000000101', 'Synthetic Admin A'),
  ('00000000-0000-0000-0000-000000000102', 'Synthetic Club Leader A'),
  ('00000000-0000-0000-0000-000000000103', 'Synthetic Student A'),
  ('00000000-0000-0000-0000-000000000201', 'Synthetic Admin B'),
  ('00000000-0000-0000-0000-000000000202', 'Synthetic Student B')
on conflict (id) do nothing;

insert into public.college_memberships (college_id, profile_id, role)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'club_leader'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'student'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000201', 'admin'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 'student')
on conflict (college_id, profile_id, role) do nothing;

insert into public.clubs (id, college_id, name, slug, created_by)
values
  (
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000001',
    'Synthetic Robotics Club A',
    'synthetic-robotics-a',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000002',
    'Synthetic Robotics Club B',
    'synthetic-robotics-b',
    '00000000-0000-0000-0000-000000000201'
  )
on conflict (id) do nothing;

insert into public.club_roles (college_id, club_id, profile_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000000102',
  'leader'
)
on conflict (club_id, profile_id, role) do nothing;

insert into public.club_memberships (
  id,
  college_id,
  club_id,
  profile_id,
  status,
  reviewed_by,
  reviewed_at
)
values
  (
    '00000000-0000-0000-0000-000000001101',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000103',
    'approved',
    '00000000-0000-0000-0000-000000000102',
    '2026-10-13 12:00:00+00'
  ),
  (
    '00000000-0000-0000-0000-000000001102',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000202',
    'approved',
    '00000000-0000-0000-0000-000000000201',
    '2026-10-13 12:00:00+00'
  )
on conflict (id) do nothing;

insert into public.events (id, college_id, club_id, created_by, title, starts_at, ends_at, status)
values
  (
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000101',
    'Synthetic Event A',
    '2026-11-01 10:00:00+00',
    '2026-11-01 11:00:00+00',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000002002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000201',
    'Synthetic Event B',
    '2026-11-02 10:00:00+00',
    '2026-11-02 11:00:00+00',
    'published'
  )
on conflict (id) do nothing;

insert into public.event_attendance (id, college_id, event_id, student_id, status, recorded_by)
values
  (
    '00000000-0000-0000-0000-000000003001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000000103',
    'present',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '00000000-0000-0000-0000-000000003002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000002002',
    '00000000-0000-0000-0000-000000000202',
    'absent',
    '00000000-0000-0000-0000-000000000201'
  )
on conflict (id) do nothing;

insert into public.courses (id, college_id, code, title, term)
values
  (
    '00000000-0000-0000-0000-000000004001',
    '00000000-0000-0000-0000-000000000001',
    'SYN101',
    'Synthetic Systems',
    '2026-fall'
  ),
  (
    '00000000-0000-0000-0000-000000004002',
    '00000000-0000-0000-0000-000000000002',
    'SYN201',
    'Synthetic Networks',
    '2026-fall'
  )
on conflict (id) do nothing;

insert into public.course_enrolments (id, college_id, course_id, student_id, term)
values
  (
    '00000000-0000-0000-0000-000000005001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000004001',
    '00000000-0000-0000-0000-000000000103',
    '2026-fall'
  ),
  (
    '00000000-0000-0000-0000-000000005002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000004002',
    '00000000-0000-0000-0000-000000000202',
    '2026-fall'
  )
on conflict (id) do nothing;

insert into public.class_sessions (id, college_id, course_id, starts_at, ends_at)
values
  (
    '00000000-0000-0000-0000-000000006001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000004001',
    '2026-11-03 09:00:00+00',
    '2026-11-03 10:00:00+00'
  ),
  (
    '00000000-0000-0000-0000-000000006002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000004002',
    '2026-11-04 09:00:00+00',
    '2026-11-04 10:00:00+00'
  )
on conflict (id) do nothing;

insert into public.class_attendance (id, college_id, class_session_id, student_id, status, recorded_by)
values
  (
    '00000000-0000-0000-0000-000000007001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000006001',
    '00000000-0000-0000-0000-000000000103',
    'present',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '00000000-0000-0000-0000-000000007002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000006002',
    '00000000-0000-0000-0000-000000000202',
    'absent',
    '00000000-0000-0000-0000-000000000201'
  )
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000103"}',
  true
);

select is(
  (select count(*)::integer from public.clubs where id = '00000000-0000-0000-0000-000000001001'),
  1,
  'student can read a same-college public club'
);
select is(
  (select count(*)::integer from public.clubs where id = '00000000-0000-0000-0000-000000001002'),
  0,
  'student cannot read a cross-college club'
);
select is(
  (
    select count(*)::integer
    from public.club_memberships
    where club_id = '00000000-0000-0000-0000-000000001001'
      and profile_id = '00000000-0000-0000-0000-000000000103'
  ),
  1,
  'student can read own same-college club membership'
);
select is(
  (select count(*)::integer from public.club_memberships where club_id = '00000000-0000-0000-0000-000000001002'),
  0,
  'student cannot read cross-college club membership'
);
select is(
  (
    select count(*)::integer
    from public.event_attendance
    where event_id = '00000000-0000-0000-0000-000000002001'
      and student_id = '00000000-0000-0000-0000-000000000103'
  ),
  1,
  'student can read own same-college event attendance'
);
select is(
  (select count(*)::integer from public.event_attendance where event_id = '00000000-0000-0000-0000-000000002002'),
  0,
  'student cannot read cross-college event attendance'
);
select is(
  (
    select count(*)::integer
    from public.class_attendance
    where class_session_id = '00000000-0000-0000-0000-000000006001'
      and student_id = '00000000-0000-0000-0000-000000000103'
  ),
  1,
  'student can read own same-college class attendance'
);
select is(
  (select count(*)::integer from public.class_attendance where class_session_id = '00000000-0000-0000-0000-000000006002'),
  0,
  'student cannot read cross-college class attendance'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000102"}',
  true
);

select is(
  (select count(*)::integer from public.event_attendance where event_id = '00000000-0000-0000-0000-000000002001'),
  1,
  'assigned club leader can read same-college event attendance'
);
select is(
  (select count(*)::integer from public.event_attendance where event_id = '00000000-0000-0000-0000-000000002002'),
  0,
  'assigned club leader cannot read cross-college event attendance'
);
select is(
  (select count(*)::integer from public.clubs where id = '00000000-0000-0000-0000-000000001001'),
  1,
  'assigned club leader can read the assigned same-college club'
);
select is(
  (
    select count(*)::integer
    from public.club_roles
    where club_id = '00000000-0000-0000-0000-000000001001'
      and profile_id = '00000000-0000-0000-0000-000000000102'
  ),
  1,
  'assigned club leader can read same-college club role'
);
select is(
  (select count(*)::integer from public.club_roles where club_id = '00000000-0000-0000-0000-000000001002'),
  0,
  'assigned club leader cannot read cross-college club role'
);
select is(
  (select count(*)::integer from public.class_attendance where class_session_id = '00000000-0000-0000-0000-000000006001'),
  0,
  'club leader cannot read classroom attendance, even in the same college'
);

select * from finish();
rollback;

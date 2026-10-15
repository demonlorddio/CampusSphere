-- CampusSphere initial database design
--
-- Assumptions:
--   * This migration runs in a Supabase database where auth.users and auth.uid()
--     are provided by Supabase Auth.
--   * The application has three membership roles: student, club_leader, and
--     admin. A person may have more than one active role in the same college;
--     this lets a club leader also be enrolled as a student.
--   * college_id is a tenant boundary, never proof supplied by a client. Every
--     policy below derives access from auth.uid() and active memberships.
--   * Storage objects are private. The application server is responsible for
--     generating object_path values and issuing short-lived signed URLs.
--   * Import rows retain normalized values and validation messages only. Raw
--     spreadsheet cells and secrets do not belong in this database design.
--
-- No seed data is included in this migration. A separate, clearly synthetic
-- fixture may be used by local policy tests or a preview environment.

create schema if not exists private;

revoke all on schema private from public;

create type public.college_status as enum ('active', 'archived');
create type public.app_role as enum ('student', 'club_leader', 'admin');
create type public.college_membership_status as enum (
  'active',
  'invited',
  'suspended',
  'revoked'
);
create type public.club_status as enum ('active', 'archived');
create type public.club_visibility as enum ('public', 'private');
create type public.club_membership_status as enum (
  'pending',
  'approved',
  'rejected',
  'left'
);
create type public.club_role_type as enum (
  'leader',
  'president',
  'secretary',
  'faculty_advisor'
);
create type public.event_visibility as enum ('public', 'members_only', 'private');
create type public.event_status as enum ('draft', 'published', 'cancelled', 'archived');
create type public.attendance_status as enum ('present', 'absent', 'excused', 'late');
create type public.course_status as enum ('active', 'archived');
create type public.enrolment_status as enum ('enrolled', 'completed', 'dropped');
create type public.class_session_status as enum ('scheduled', 'completed', 'cancelled');
create type public.achievement_status as enum ('draft', 'published', 'archived');
create type public.import_entity_type as enum (
  'profile',
  'club',
  'event',
  'course',
  'enrolment',
  'event_attendance',
  'class_attendance'
);
create type public.import_job_status as enum (
  'pending',
  'validating',
  'previewed',
  'committed',
  'failed',
  'cancelled'
);
create type public.import_row_status as enum ('pending', 'valid', 'invalid', 'imported');
create type public.stored_file_purpose as enum (
  'import_source',
  'achievement_evidence',
  'profile_media'
);
create type public.file_retention_status as enum ('active', 'retained', 'pending_deletion', 'deleted');
create type public.audit_outcome as enum ('success', 'failure');

create table public.colleges (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  status public.college_status not null default 'active',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint colleges_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint colleges_name_not_blank check (char_length(btrim(name)) between 1 and 200),
  constraint colleges_timezone_not_blank check (char_length(btrim(timezone)) between 1 and 100),
  constraint colleges_slug_unique unique (slug)
);

comment on table public.colleges is
  'Tenant institutions. Assumption: a college is the ownership boundary for every exposed record except global profiles.';

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank check (char_length(btrim(display_name)) between 1 and 160),
  constraint profiles_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 2048)
);

comment on table public.profiles is
  'Minimal profile data linked to Supabase Auth; passwords, tokens, and auth secrets remain in auth.users or outside the database.';

create table public.college_memberships (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  role public.app_role not null,
  status public.college_membership_status not null default 'active',
  external_ref text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint college_memberships_external_ref_length check (
    external_ref is null or char_length(btrim(external_ref)) between 1 and 160
  ),
  constraint college_memberships_unique_role unique (college_id, profile_id, role),
  constraint college_memberships_college_id_id_unique unique (college_id, id)
);

comment on table public.college_memberships is
  'A profile may hold multiple roles in one college. Only active memberships grant tenant access.';

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  name text not null,
  slug text not null,
  category text,
  description text,
  visibility public.club_visibility not null default 'public',
  status public.club_status not null default 'active',
  contact_email text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clubs_name_not_blank check (char_length(btrim(name)) between 1 and 200),
  constraint clubs_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint clubs_category_length check (category is null or char_length(btrim(category)) <= 100),
  constraint clubs_description_length check (description is null or char_length(description) <= 10000),
  constraint clubs_contact_email_length check (contact_email is null or char_length(contact_email) <= 320),
  constraint clubs_college_slug_unique unique (college_id, slug),
  constraint clubs_college_id_id_unique unique (college_id, id)
);

comment on table public.clubs is
  'College-owned clubs. A club leader can edit an assigned club, while creation and role assignment remain admin operations.';

create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  club_id uuid not null,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  status public.club_membership_status not null default 'pending',
  requested_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_memberships_club_same_college foreign key (college_id, club_id)
    references public.clubs(college_id, id) on delete cascade,
  constraint club_memberships_unique_profile_club unique (club_id, profile_id),
  constraint club_memberships_reviewed_at_pair check ((reviewed_at is null) = (reviewed_by is null)),
  constraint club_memberships_college_id_id_unique unique (college_id, id)
);

comment on table public.club_memberships is
  'Membership requests and decisions. A student can create only their own pending request; club managers/admins can review it.';

create table public.club_roles (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  club_id uuid not null,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  role public.club_role_type not null,
  starts_on date not null default current_date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_roles_club_same_college foreign key (college_id, club_id)
    references public.clubs(college_id, id) on delete cascade,
  constraint club_roles_dates check (ends_on is null or ends_on >= starts_on),
  constraint club_roles_unique_assignment unique (club_id, profile_id, role),
  constraint club_roles_college_id_id_unique unique (college_id, id)
);

comment on table public.club_roles is
  'Fine-grained club assignments. leader and president are treated as club managers for event and attendance policies.';

create table public.events (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  club_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  visibility public.event_visibility not null default 'public',
  status public.event_status not null default 'draft',
  capacity integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_club_same_college foreign key (college_id, club_id)
    references public.clubs(college_id, id) on delete cascade,
  constraint events_title_not_blank check (char_length(btrim(title)) between 1 and 240),
  constraint events_description_length check (description is null or char_length(description) <= 20000),
  constraint events_location_length check (location is null or char_length(location) <= 500),
  constraint events_time_order check (ends_at > starts_at),
  constraint events_capacity_positive check (capacity is null or capacity > 0),
  constraint events_college_id_id_unique unique (college_id, id)
);

comment on table public.events is
  'A college event may be attached to a club or be college-wide. Club leaders can manage only events for assigned clubs.';

create table public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  event_id uuid not null,
  student_id uuid not null references public.profiles(id) on delete restrict,
  status public.attendance_status not null,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_attendance_event_same_college foreign key (college_id, event_id)
    references public.events(college_id, id) on delete cascade,
  constraint event_attendance_unique_student unique (event_id, student_id),
  constraint event_attendance_college_id_id_unique unique (college_id, id)
);

comment on table public.event_attendance is
  'Private attendance context for events. Students see their own rows; assigned club managers and admins see permitted event rows.';

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  code text not null,
  title text not null,
  department text,
  term text not null,
  status public.course_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_code_format check (code = upper(code) and char_length(btrim(code)) between 1 and 40),
  constraint courses_title_not_blank check (char_length(btrim(title)) between 1 and 240),
  constraint courses_department_length check (department is null or char_length(btrim(department)) <= 160),
  constraint courses_term_not_blank check (char_length(btrim(term)) between 1 and 80),
  constraint courses_college_code_term_unique unique (college_id, code, term),
  constraint courses_college_id_id_unique unique (college_id, id),
  constraint courses_college_id_id_term_unique unique (college_id, id, term)
);

comment on table public.courses is
  'College course catalogue. Class attendance is intentionally separate from event attendance.';

create table public.course_enrolments (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  course_id uuid not null,
  student_id uuid not null references public.profiles(id) on delete restrict,
  term text not null,
  status public.enrolment_status not null default 'enrolled',
  enrolled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_enrolments_course_same_college_term foreign key (college_id, course_id, term)
    references public.courses(college_id, id, term) on delete cascade,
  constraint course_enrolments_term_not_blank check (char_length(btrim(term)) between 1 and 80),
  constraint course_enrolments_unique_student_course unique (course_id, student_id),
  constraint course_enrolments_college_id_id_unique unique (college_id, id)
);

comment on table public.course_enrolments is
  'Student course membership. Only active student-role members can be targets of enrolment or class-attendance records.';

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  course_id uuid not null,
  instructor_id uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  room text,
  status public.class_session_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_sessions_course_same_college foreign key (college_id, course_id)
    references public.courses(college_id, id) on delete cascade,
  constraint class_sessions_time_order check (ends_at > starts_at),
  constraint class_sessions_room_length check (room is null or char_length(room) <= 200),
  constraint class_sessions_college_id_id_unique unique (college_id, id)
);

comment on table public.class_sessions is
  'Scheduled class meetings. Club leaders receive no class-session or class-attendance policy access.';

create table public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  class_session_id uuid not null,
  student_id uuid not null references public.profiles(id) on delete restrict,
  status public.attendance_status not null,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_attendance_session_same_college foreign key (college_id, class_session_id)
    references public.class_sessions(college_id, id) on delete cascade,
  constraint class_attendance_unique_student unique (class_session_id, student_id),
  constraint class_attendance_college_id_id_unique unique (college_id, id)
);

comment on table public.class_attendance is
  'Private classroom attendance. The RLS policy permits only the student or an admin, never a club leader.';

create table public.stored_files (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  bucket_name text not null default 'campus-private',
  object_path text not null,
  purpose public.stored_file_purpose not null,
  original_filename text,
  content_type text,
  byte_size bigint,
  checksum_sha256 text,
  retention_status public.file_retention_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stored_files_private_bucket check (bucket_name <> 'public'),
  constraint stored_files_object_path_not_blank check (char_length(btrim(object_path)) between 1 and 1024),
  constraint stored_files_original_filename_length check (
    original_filename is null or char_length(original_filename) <= 255
  ),
  constraint stored_files_content_type_length check (content_type is null or char_length(content_type) <= 255),
  constraint stored_files_byte_size_valid check (byte_size is null or byte_size >= 0),
  constraint stored_files_checksum_format check (
    checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-fA-F]{64}$'
  ),
  constraint stored_files_bucket_path_unique unique (bucket_name, object_path),
  constraint stored_files_college_id_id_unique unique (college_id, id)
);

comment on table public.stored_files is
  'Metadata for private Supabase Storage objects. The original filename is metadata only; object paths must be server-generated.';

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  club_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  achieved_on date not null,
  evidence_file_id uuid,
  status public.achievement_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint achievements_club_same_college foreign key (college_id, club_id)
    references public.clubs(college_id, id) on delete cascade,
  constraint achievements_evidence_same_college foreign key (college_id, evidence_file_id)
    references public.stored_files(college_id, id) on delete restrict,
  constraint achievements_title_not_blank check (char_length(btrim(title)) between 1 and 240),
  constraint achievements_description_length check (description is null or char_length(description) <= 20000),
  constraint achievements_college_id_id_unique unique (college_id, id)
);

comment on table public.achievements is
  'Club or college achievements. Evidence references private stored-file metadata and is never a public URL.';

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  source_file_id uuid,
  source_filename text not null,
  template_version text not null,
  status public.import_job_status not null default 'pending',
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  error_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint import_jobs_source_file_same_college foreign key (college_id, source_file_id)
    references public.stored_files(college_id, id) on delete restrict,
  constraint import_jobs_source_filename_not_blank check (char_length(btrim(source_filename)) between 1 and 255),
  constraint import_jobs_source_filename_no_path check (source_filename !~ '[\\/]'),
  constraint import_jobs_template_version_not_blank check (char_length(btrim(template_version)) between 1 and 80),
  constraint import_jobs_counts_nonnegative check (
    total_rows >= 0 and valid_rows >= 0 and invalid_rows >= 0 and valid_rows + invalid_rows <= total_rows
  ),
  constraint import_jobs_error_summary_length check (error_summary is null or char_length(error_summary) <= 20000),
  constraint import_jobs_college_id_id_unique unique (college_id, id)
);

comment on table public.import_jobs is
  'Admin-owned import metadata. Validation and confirmation happen server-side before records are committed.';

create table public.import_rows (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  import_job_id uuid not null,
  row_number integer not null,
  entity_type public.import_entity_type not null,
  normalized_values jsonb not null default '{}'::jsonb,
  validation_status public.import_row_status not null default 'pending',
  error_messages text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint import_rows_job_same_college foreign key (college_id, import_job_id)
    references public.import_jobs(college_id, id) on delete cascade,
  constraint import_rows_row_number_positive check (row_number > 0),
  constraint import_rows_normalized_object check (jsonb_typeof(normalized_values) = 'object'),
  constraint import_rows_unique_job_row unique (import_job_id, row_number),
  constraint import_rows_college_id_id_unique unique (college_id, id)
);

comment on table public.import_rows is
  'Normalized, non-secret validation output. Do not store raw spreadsheet cells, passwords, tokens, or full sensitive records here.';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references public.colleges(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  outcome public.audit_outcome not null,
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_not_blank check (char_length(btrim(action)) between 1 and 120),
  constraint audit_logs_entity_type_not_blank check (char_length(btrim(entity_type)) between 1 and 120),
  constraint audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.audit_logs is
  'Append-only security/audit metadata. Never put passwords, access tokens, or raw import rows in metadata.';

-- Tenant and lookup indexes. The composite foreign keys above also make a
-- mismatched college_id impossible for child records.
create index college_memberships_profile_status_idx
  on public.college_memberships (profile_id, status);
create index college_memberships_college_role_status_idx
  on public.college_memberships (college_id, role, status);
create index clubs_college_status_visibility_idx
  on public.clubs (college_id, status, visibility);
create index club_memberships_college_profile_status_idx
  on public.club_memberships (college_id, profile_id, status);
create index club_memberships_college_club_status_idx
  on public.club_memberships (college_id, club_id, status);
create index club_roles_college_club_role_idx
  on public.club_roles (college_id, club_id, role);
create index club_roles_profile_college_idx
  on public.club_roles (profile_id, college_id);
create index events_college_status_start_idx
  on public.events (college_id, status, starts_at);
create index events_college_club_start_idx
  on public.events (college_id, club_id, starts_at);
create index event_attendance_college_event_idx
  on public.event_attendance (college_id, event_id);
create index event_attendance_college_student_idx
  on public.event_attendance (college_id, student_id);
create index courses_college_term_status_idx
  on public.courses (college_id, term, status);
create index courses_college_lower_code_term_idx
  on public.courses (college_id, lower(code), term);
create index course_enrolments_college_student_status_idx
  on public.course_enrolments (college_id, student_id, status);
create index course_enrolments_college_course_status_idx
  on public.course_enrolments (college_id, course_id, status);
create index class_sessions_college_course_start_idx
  on public.class_sessions (college_id, course_id, starts_at);
create index class_attendance_college_session_idx
  on public.class_attendance (college_id, class_session_id);
create index class_attendance_college_student_idx
  on public.class_attendance (college_id, student_id);
create index achievements_college_status_date_idx
  on public.achievements (college_id, status, achieved_on);
create index stored_files_college_purpose_retention_idx
  on public.stored_files (college_id, purpose, retention_status);
create index import_jobs_college_status_created_idx
  on public.import_jobs (college_id, status, created_at);
create index import_rows_college_status_idx
  on public.import_rows (college_id, validation_status);
create index audit_logs_college_created_idx
  on public.audit_logs (college_id, created_at);
create index audit_logs_actor_created_idx
  on public.audit_logs (actor_id, created_at);

-- SECURITY DEFINER helpers read memberships and assignments without causing
-- recursive RLS policy evaluation. They accept an explicit profile id so a
-- policy always passes the authenticated session's auth.uid() value.
create or replace function private.is_active_member(
  p_college_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.college_memberships as cm
    where cm.college_id = p_college_id
      and cm.profile_id = p_profile_id
      and cm.status = 'active'::public.college_membership_status
  );
$$;

create or replace function private.has_active_role(
  p_college_id uuid,
  p_profile_id uuid,
  p_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.college_memberships as cm
    where cm.college_id = p_college_id
      and cm.profile_id = p_profile_id
      and cm.role = p_role
      and cm.status = 'active'::public.college_membership_status
  );
$$;

create or replace function private.is_admin(
  p_college_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.has_active_role(p_college_id, p_profile_id, 'admin'::public.app_role);
$$;

create or replace function private.is_active_student(
  p_college_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.has_active_role(p_college_id, p_profile_id, 'student'::public.app_role);
$$;

create or replace function private.is_club_manager(
  p_college_id uuid,
  p_club_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.has_active_role(p_college_id, p_profile_id, 'club_leader'::public.app_role)
    and exists (
      select 1
      from public.club_roles as cr
      where cr.college_id = p_college_id
        and cr.club_id = p_club_id
        and cr.profile_id = p_profile_id
        and cr.role in (
          'leader'::public.club_role_type,
          'president'::public.club_role_type
        )
        and cr.starts_on <= current_date
        and (cr.ends_on is null or cr.ends_on >= current_date)
    );
$$;

create or replace function private.is_any_club_manager(
  p_college_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.has_active_role(p_college_id, p_profile_id, 'club_leader'::public.app_role)
    and exists (
      select 1
      from public.club_roles as cr
      where cr.college_id = p_college_id
        and cr.profile_id = p_profile_id
        and cr.role in (
          'leader'::public.club_role_type,
          'president'::public.club_role_type
        )
        and cr.starts_on <= current_date
        and (cr.ends_on is null or cr.ends_on >= current_date)
    );
$$;

create or replace function private.is_approved_club_member(
  p_college_id uuid,
  p_club_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.club_memberships as cm
    where cm.college_id = p_college_id
      and cm.club_id = p_club_id
      and cm.profile_id = p_profile_id
      and cm.status = 'approved'::public.club_membership_status
  );
$$;

create or replace function private.is_public_active_club(
  p_college_id uuid,
  p_club_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.clubs as c
    where c.id = p_club_id
      and c.college_id = p_college_id
      and c.status = 'active'::public.club_status
      and c.visibility = 'public'::public.club_visibility
  );
$$;

create or replace function private.can_manage_event(
  p_event_id uuid,
  p_college_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.events as e
    where e.id = p_event_id
      and e.college_id = p_college_id
      and (
        private.is_admin(p_college_id, p_profile_id)
        or (
          e.club_id is not null
          and private.is_club_manager(p_college_id, e.club_id, p_profile_id)
        )
      )
  );
$$;

create or replace function private.has_event_attendance(
  p_college_id uuid,
  p_event_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.event_attendance as ea
    where ea.college_id = p_college_id
      and ea.event_id = p_event_id
      and ea.student_id = p_profile_id
  );
$$;

create or replace function private.is_enrolled_in_course(
  p_college_id uuid,
  p_course_id uuid,
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.is_active_student(p_college_id, p_profile_id)
    and exists (
      select 1
      from public.course_enrolments as ce
      where ce.college_id = p_college_id
        and ce.course_id = p_course_id
        and ce.student_id = p_profile_id
        and ce.status in (
          'enrolled'::public.enrolment_status,
          'completed'::public.enrolment_status
        )
  );
$$;

create or replace function private.can_record_class_attendance(
  p_college_id uuid,
  p_class_session_id uuid,
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.class_sessions as cs
    where cs.id = p_class_session_id
      and cs.college_id = p_college_id
      and private.is_enrolled_in_course(cs.college_id, cs.course_id, p_student_id)
  );
$$;

create or replace function private.can_view_profile(
  p_target_profile_id uuid,
  p_viewer_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.college_memberships as target_cm
    join public.college_memberships as viewer_cm
      on viewer_cm.college_id = target_cm.college_id
    where target_cm.profile_id = p_target_profile_id
      and viewer_cm.profile_id = p_viewer_profile_id
      and target_cm.status = 'active'::public.college_membership_status
      and viewer_cm.status = 'active'::public.college_membership_status
  );
$$;

create or replace function private.can_administer_profile(
  p_target_profile_id uuid,
  p_admin_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1
    from public.college_memberships as target_cm
    join public.college_memberships as admin_cm
      on admin_cm.college_id = target_cm.college_id
    where target_cm.profile_id = p_target_profile_id
      and target_cm.status = 'active'::public.college_membership_status
      and admin_cm.profile_id = p_admin_profile_id
      and admin_cm.role = 'admin'::public.app_role
      and admin_cm.status = 'active'::public.college_membership_status
  );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger colleges_set_updated_at
before update on public.colleges
for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
create trigger college_memberships_set_updated_at
before update on public.college_memberships
for each row execute function private.set_updated_at();
create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function private.set_updated_at();
create trigger club_memberships_set_updated_at
before update on public.club_memberships
for each row execute function private.set_updated_at();
create trigger club_roles_set_updated_at
before update on public.club_roles
for each row execute function private.set_updated_at();
create trigger events_set_updated_at
before update on public.events
for each row execute function private.set_updated_at();
create trigger event_attendance_set_updated_at
before update on public.event_attendance
for each row execute function private.set_updated_at();
create trigger courses_set_updated_at
before update on public.courses
for each row execute function private.set_updated_at();
create trigger course_enrolments_set_updated_at
before update on public.course_enrolments
for each row execute function private.set_updated_at();
create trigger class_sessions_set_updated_at
before update on public.class_sessions
for each row execute function private.set_updated_at();
create trigger class_attendance_set_updated_at
before update on public.class_attendance
for each row execute function private.set_updated_at();
create trigger stored_files_set_updated_at
before update on public.stored_files
for each row execute function private.set_updated_at();
create trigger achievements_set_updated_at
before update on public.achievements
for each row execute function private.set_updated_at();
create trigger import_jobs_set_updated_at
before update on public.import_jobs
for each row execute function private.set_updated_at();
create trigger import_rows_set_updated_at
before update on public.import_rows
for each row execute function private.set_updated_at();

-- RLS is enabled on every exposed table. No anon policies are defined.
alter table public.colleges enable row level security;
alter table public.profiles enable row level security;
alter table public.college_memberships enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_roles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.courses enable row level security;
alter table public.course_enrolments enable row level security;
alter table public.class_sessions enable row level security;
alter table public.class_attendance enable row level security;
alter table public.stored_files enable row level security;
alter table public.achievements enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_rows enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_shared_college
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or private.can_view_profile(id, (select auth.uid()))
  );

create policy profiles_insert_self
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_self_or_admin
  on public.profiles for update to authenticated
  using (
    id = (select auth.uid())
    or private.can_administer_profile(id, (select auth.uid()))
  )
  with check (
    id = (select auth.uid())
    or private.can_administer_profile(id, (select auth.uid()))
  );

create policy colleges_select_active_member
  on public.colleges for select to authenticated
  using (private.is_active_member(id, (select auth.uid())));

create policy colleges_update_admin
  on public.colleges for update to authenticated
  using (private.is_admin(id, (select auth.uid())))
  with check (private.is_admin(id, (select auth.uid())));

create policy college_memberships_select_self_or_admin
  on public.college_memberships for select to authenticated
  using (
    profile_id = (select auth.uid())
    or private.is_admin(college_id, (select auth.uid()))
  );

create policy college_memberships_insert_admin
  on public.college_memberships for insert to authenticated
  with check (private.is_admin(college_id, (select auth.uid())));

create policy college_memberships_update_admin
  on public.college_memberships for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (private.is_admin(college_id, (select auth.uid())));

create policy clubs_select_member_with_visibility
  on public.clubs for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      (
        status = 'active'::public.club_status
        and visibility = 'public'::public.club_visibility
      )
      or private.is_admin(college_id, (select auth.uid()))
      or private.is_club_manager(college_id, id, (select auth.uid()))
      or private.is_approved_club_member(college_id, id, (select auth.uid()))
    )
  );

create policy clubs_insert_admin
  on public.clubs for insert to authenticated
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and (created_by is null or created_by = (select auth.uid()))
  );

create policy clubs_update_admin_or_manager
  on public.clubs for update to authenticated
  using (
    private.is_admin(college_id, (select auth.uid()))
    or private.is_club_manager(college_id, id, (select auth.uid()))
  )
  with check (
    private.is_admin(college_id, (select auth.uid()))
    or private.is_club_manager(college_id, id, (select auth.uid()))
  );

create policy club_memberships_select_member_or_manager
  on public.club_memberships for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      profile_id = (select auth.uid())
      or private.is_admin(college_id, (select auth.uid()))
      or private.is_club_manager(college_id, club_id, (select auth.uid()))
    )
  );

create policy club_memberships_insert_self_request_or_admin
  on public.club_memberships for insert to authenticated
  with check (
    private.is_active_member(college_id, profile_id)
    and (
      (
        profile_id = (select auth.uid())
        and private.is_active_student(college_id, profile_id)
        and status = 'pending'::public.club_membership_status
        and private.is_public_active_club(college_id, club_id)
      )
      or private.is_admin(college_id, (select auth.uid()))
    )
  );

create policy club_memberships_update_admin_or_manager
  on public.club_memberships for update to authenticated
  using (
    private.is_admin(college_id, (select auth.uid()))
    or private.is_club_manager(college_id, club_id, (select auth.uid()))
  )
  with check (
    private.is_active_member(college_id, profile_id)
    and (
      private.is_admin(college_id, (select auth.uid()))
      or private.is_club_manager(college_id, club_id, (select auth.uid()))
    )
  );

create policy club_roles_select_same_college
  on public.club_roles for select to authenticated
  using (private.is_active_member(college_id, (select auth.uid())));

create policy club_roles_insert_admin
  on public.club_roles for insert to authenticated
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and private.is_active_member(college_id, profile_id)
  );

create policy club_roles_update_admin
  on public.club_roles for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and private.is_active_member(college_id, profile_id)
  );

create policy club_roles_delete_admin
  on public.club_roles for delete to authenticated
  using (private.is_admin(college_id, (select auth.uid())));

create policy events_select_visible_or_managed
  on public.events for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      private.is_admin(college_id, (select auth.uid()))
      or (
        status = 'published'::public.event_status
        and (
          visibility = 'public'::public.event_visibility
          or (
            visibility = 'members_only'::public.event_visibility
            and club_id is not null
            and private.is_approved_club_member(college_id, club_id, (select auth.uid()))
          )
        )
      )
      or (
        club_id is not null
        and private.is_club_manager(college_id, club_id, (select auth.uid()))
      )
      or exists (
        select 1
        where private.has_event_attendance(college_id, id, (select auth.uid()))
      )
    )
  );

create policy events_insert_admin_or_manager
  on public.events for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      private.is_admin(college_id, (select auth.uid()))
      or (
        club_id is not null
        and private.is_club_manager(college_id, club_id, (select auth.uid()))
      )
    )
  );

create policy events_update_admin_or_manager
  on public.events for update to authenticated
  using (
    private.is_admin(college_id, (select auth.uid()))
    or (
      club_id is not null
      and private.is_club_manager(college_id, club_id, (select auth.uid()))
    )
  )
  with check (
    private.is_admin(college_id, (select auth.uid()))
    or (
      club_id is not null
      and private.is_club_manager(college_id, club_id, (select auth.uid()))
    )
  );

create policy event_attendance_select_student_manager_or_admin
  on public.event_attendance for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      student_id = (select auth.uid())
      or private.is_admin(college_id, (select auth.uid()))
      or private.can_manage_event(event_id, college_id, (select auth.uid()))
    )
  );

create policy event_attendance_insert_manager_or_admin
  on public.event_attendance for insert to authenticated
  with check (
    private.can_manage_event(event_id, college_id, (select auth.uid()))
    and recorded_by = (select auth.uid())
    and private.is_active_student(college_id, student_id)
  );

create policy event_attendance_update_manager_or_admin
  on public.event_attendance for update to authenticated
  using (private.can_manage_event(event_id, college_id, (select auth.uid())))
  with check (
    private.can_manage_event(event_id, college_id, (select auth.uid()))
    and recorded_by = (select auth.uid())
    and private.is_active_student(college_id, student_id)
  );

create policy courses_select_member_active_or_admin
  on public.courses for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      status = 'active'::public.course_status
      or private.is_admin(college_id, (select auth.uid()))
    )
  );

create policy courses_insert_admin
  on public.courses for insert to authenticated
  with check (private.is_admin(college_id, (select auth.uid())));

create policy courses_update_admin
  on public.courses for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (private.is_admin(college_id, (select auth.uid())));

create policy course_enrolments_select_student_or_admin
  on public.course_enrolments for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      student_id = (select auth.uid())
      or private.is_admin(college_id, (select auth.uid()))
    )
  );

create policy course_enrolments_insert_admin
  on public.course_enrolments for insert to authenticated
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and private.is_active_student(college_id, student_id)
  );

create policy course_enrolments_update_admin
  on public.course_enrolments for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and private.is_active_student(college_id, student_id)
  );

create policy class_sessions_select_enrolled_student_or_admin
  on public.class_sessions for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      private.is_admin(college_id, (select auth.uid()))
      or private.is_enrolled_in_course(college_id, course_id, (select auth.uid()))
    )
  );

create policy class_sessions_insert_admin
  on public.class_sessions for insert to authenticated
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and (
      instructor_id is null
      or private.is_active_member(college_id, instructor_id)
    )
  );

create policy class_sessions_update_admin
  on public.class_sessions for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and (
      instructor_id is null
      or private.is_active_member(college_id, instructor_id)
    )
  );

create policy class_attendance_select_student_or_admin
  on public.class_attendance for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      student_id = (select auth.uid())
      or private.is_admin(college_id, (select auth.uid()))
    )
  );

create policy class_attendance_insert_admin
  on public.class_attendance for insert to authenticated
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and recorded_by = (select auth.uid())
    and private.is_active_student(college_id, student_id)
    and private.can_record_class_attendance(college_id, class_session_id, student_id)
  );

create policy class_attendance_update_admin
  on public.class_attendance for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and recorded_by = (select auth.uid())
    and private.is_active_student(college_id, student_id)
    and private.can_record_class_attendance(college_id, class_session_id, student_id)
  );

create policy stored_files_select_uploader_or_admin
  on public.stored_files for select to authenticated
  using (
    uploaded_by = (select auth.uid())
    or private.is_admin(college_id, (select auth.uid()))
  );

create policy stored_files_insert_admin_or_club_manager
  on public.stored_files for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and (
      private.is_admin(college_id, (select auth.uid()))
      or (
        purpose = 'achievement_evidence'::public.stored_file_purpose
        and private.is_any_club_manager(college_id, (select auth.uid()))
      )
    )
  );

create policy stored_files_update_admin
  on public.stored_files for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (private.is_admin(college_id, (select auth.uid())));

create policy achievements_select_published_or_managed
  on public.achievements for select to authenticated
  using (
    private.is_active_member(college_id, (select auth.uid()))
    and (
      status = 'published'::public.achievement_status
      or private.is_admin(college_id, (select auth.uid()))
      or (
        club_id is not null
        and private.is_club_manager(college_id, club_id, (select auth.uid()))
      )
    )
  );

create policy achievements_insert_admin_or_manager
  on public.achievements for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      private.is_admin(college_id, (select auth.uid()))
      or (
        club_id is not null
        and private.is_club_manager(college_id, club_id, (select auth.uid()))
      )
    )
  );

create policy achievements_update_admin_or_manager
  on public.achievements for update to authenticated
  using (
    private.is_admin(college_id, (select auth.uid()))
    or (
      club_id is not null
      and private.is_club_manager(college_id, club_id, (select auth.uid()))
    )
  )
  with check (
    private.is_admin(college_id, (select auth.uid()))
    or (
      club_id is not null
      and private.is_club_manager(college_id, club_id, (select auth.uid()))
    )
  );

create policy import_jobs_select_admin
  on public.import_jobs for select to authenticated
  using (private.is_admin(college_id, (select auth.uid())));

create policy import_jobs_insert_admin
  on public.import_jobs for insert to authenticated
  with check (
    private.is_admin(college_id, (select auth.uid()))
    and uploaded_by = (select auth.uid())
  );

create policy import_jobs_update_admin
  on public.import_jobs for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (private.is_admin(college_id, (select auth.uid())));

create policy import_rows_select_admin
  on public.import_rows for select to authenticated
  using (private.is_admin(college_id, (select auth.uid())));

create policy import_rows_insert_admin
  on public.import_rows for insert to authenticated
  with check (private.is_admin(college_id, (select auth.uid())));

create policy import_rows_update_admin
  on public.import_rows for update to authenticated
  using (private.is_admin(college_id, (select auth.uid())))
  with check (private.is_admin(college_id, (select auth.uid())));

create policy audit_logs_select_actor_or_admin
  on public.audit_logs for select to authenticated
  using (
    college_id is not null
    and private.is_active_member(college_id, (select auth.uid()))
    and (
      actor_id = (select auth.uid())
      or private.is_admin(college_id, (select auth.uid()))
    )
  );

create policy audit_logs_insert_authenticated_actor
  on public.audit_logs for insert to authenticated
  with check (
    actor_id = (select auth.uid())
    and college_id is not null
    and private.is_active_member(college_id, (select auth.uid()))
  );

-- Explicit table grants are intentionally narrower than service_role. The
-- authenticated role receives only operations represented by the policies;
-- anon receives no table privileges and therefore cannot bypass RLS through
-- a direct PostgREST request.
revoke all on all tables in schema public from public;
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
revoke all on all sequences in schema public from public;
revoke all on all sequences in schema public from anon;
revoke all on all sequences in schema public from authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;

grant select, insert, update on public.profiles to authenticated;
grant select, update on public.colleges to authenticated;
grant select, insert, update on public.college_memberships to authenticated;
grant select, insert, update on public.clubs to authenticated;
grant select, insert, update on public.club_memberships to authenticated;
grant select, insert, update, delete on public.club_roles to authenticated;
grant select, insert, update on public.events to authenticated;
grant select, insert, update on public.event_attendance to authenticated;
grant select, insert, update on public.courses to authenticated;
grant select, insert, update on public.course_enrolments to authenticated;
grant select, insert, update on public.class_sessions to authenticated;
grant select, insert, update on public.class_attendance to authenticated;
grant select, insert, update on public.stored_files to authenticated;
grant select, insert, update on public.achievements to authenticated;
grant select, insert, update on public.import_jobs to authenticated;
grant select, insert, update on public.import_rows to authenticated;
grant select, insert on public.audit_logs to authenticated;

grant usage on schema private to authenticated, service_role;
revoke all on all functions in schema private from public;
grant execute on function private.is_active_member(uuid, uuid) to authenticated;
grant execute on function private.has_active_role(uuid, uuid, public.app_role) to authenticated;
grant execute on function private.is_admin(uuid, uuid) to authenticated;
grant execute on function private.is_active_student(uuid, uuid) to authenticated;
grant execute on function private.is_club_manager(uuid, uuid, uuid) to authenticated;
grant execute on function private.is_any_club_manager(uuid, uuid) to authenticated;
grant execute on function private.is_approved_club_member(uuid, uuid, uuid) to authenticated;
grant execute on function private.is_public_active_club(uuid, uuid) to authenticated;
grant execute on function private.can_manage_event(uuid, uuid, uuid) to authenticated;
grant execute on function private.has_event_attendance(uuid, uuid, uuid) to authenticated;
grant execute on function private.is_enrolled_in_course(uuid, uuid, uuid) to authenticated;
grant execute on function private.can_record_class_attendance(uuid, uuid, uuid) to authenticated;
grant execute on function private.can_view_profile(uuid, uuid) to authenticated;
grant execute on function private.can_administer_profile(uuid, uuid) to authenticated;

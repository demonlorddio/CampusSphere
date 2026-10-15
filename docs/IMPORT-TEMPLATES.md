# CampusSphere import templates and data contract

These are the first-version spreadsheet contracts. They are intentionally explicit so an administrator can understand what will happen before importing anything.

## General rules

- Use `.xlsx` for the first prototype; CSV export is a separate, sanitized feature.
- The authenticated administrator's college is the tenant. There is **no `college_id` column** in user-uploaded templates.
- Do not include passwords, access tokens, government IDs, home addresses, health data, grades, or raw attendance explanations.
- UTF-8 text, one header row, no merged cells, and one logical record per row.
- IDs such as `student_ref`, `club_ref`, `event_ref`, `course_ref`, and `session_ref` are institution-owned external references. They are not database UUIDs and must be unique within the relevant college/term.
- Dates use `YYYY-MM-DD`; timestamps use an explicit ISO-8601 value with timezone when time matters.
- Blank optional fields remain blank; unknown columns are rejected rather than silently ignored.
- A workbook is previewed and confirmed before any database transaction is committed.

## 1. Students

| Column | Required | Meaning |
|---|---:|---|
| `student_ref` | Yes | Stable college student identifier |
| `full_name` | Yes | Display name |
| `email` | Yes | Institution email or approved account email |
| `department` | No | Academic department |
| `year_of_study` | No | Normalized year value such as `1`, `2`, `3`, `4` |
| `status` | No | `active`, `invited`, `suspended`, or `revoked` |

The import creates or updates a student profile and college membership. It does not set a privileged role. Administrator and club-leader assignments use a separate restricted workflow.

## 2. Clubs and leaders

| Column | Required | Meaning |
|---|---:|---|
| `club_ref` | Yes | Stable club identifier |
| `club_name` | Yes | Public club name |
| `category` | No | Technology, arts, sports, service, etc. |
| `description` | No | Plain-text description |
| `visibility` | No | `public` or `private` |
| `leader_student_ref` | No | Existing student to assign as a club leader |
| `faculty_advisor_email` | No | Reference only until staff identity support exists |

The importer verifies that the leader exists in the authenticated college. It never accepts a leader from another tenant.

## 3. Events

| Column | Required | Meaning |
|---|---:|---|
| `event_ref` | Yes | Stable event identifier |
| `club_ref` | No | Existing club; blank means college-wide event |
| `title` | Yes | Event title |
| `description` | No | Plain-text event details |
| `starts_at` | Yes | ISO-8601 timestamp with timezone |
| `ends_at` | Yes | Must be after `starts_at` |
| `location` | No | Room or venue |
| `visibility` | No | `public`, `members_only`, or `private` |
| `status` | No | `draft`, `published`, `cancelled`, or `archived` |

## 4. Event attendance

| Column | Required | Meaning |
|---|---:|---|
| `event_ref` | Yes | Existing event in this college |
| `student_ref` | Yes | Existing student in this college |
| `attendance_status` | Yes | `present`, `absent`, `excused`, or `late` |
| `recorded_at` | No | When the record was entered; server time is the fallback |

The import checks that both references belong to the same college and that one row does not duplicate an existing event/student pair.

## 5. Courses and enrolments

### Courses

| Column | Required | Meaning |
|---|---:|---|
| `course_ref` | Yes | Stable course identifier |
| `course_code` | Yes | Uppercase course code |
| `course_title` | Yes | Course title |
| `department` | No | Academic department |
| `term` | Yes | Term label such as `2026-fall` |

### Enrolments

| Column | Required | Meaning |
|---|---:|---|
| `course_ref` | Yes | Existing course in this college and term |
| `student_ref` | Yes | Existing student in this college |
| `term` | Yes | Must match the course term |
| `status` | No | `enrolled`, `completed`, or `dropped` |

## 6. Class sessions and classroom attendance

### Class sessions

| Column | Required | Meaning |
|---|---:|---|
| `session_ref` | Yes | Stable class-session identifier |
| `course_ref` | Yes | Existing course |
| `starts_at` | Yes | ISO-8601 timestamp with timezone |
| `ends_at` | Yes | Must be after `starts_at` |
| `room` | No | Classroom or online-room label |

### Class attendance

| Column | Required | Meaning |
|---|---:|---|
| `session_ref` | Yes | Existing class session |
| `student_ref` | Yes | Student enrolled in the session's course |
| `attendance_status` | Yes | `present`, `absent`, `excused`, or `late` |
| `recorded_at` | No | Server time is the fallback |

Class attendance is private. A student can see only their own records. College administrators can see permitted college reports. Club leaders cannot see class attendance merely because they lead a club.

## Validation and security checklist

Before preview:

- Check extension, file signature/parser compatibility, file size, sheet count, header order, row limit, and formula-like cells.
- Normalize whitespace and case only where the contract says to do so; preserve the original display text separately only if needed.
- Validate emails, dates, enums, lengths, reference existence, duplicate references, and cross-tenant references.
- Reject formula cells and dangerous values for fields that may be exported; never evaluate spreadsheet formulas on the server.
- Return row-numbered errors and avoid including other students' records in the response.

Before commit:

- Show counts for valid, invalid, skipped, created, and updated rows.
- Require an authenticated college administrator to confirm.
- Run the import in a transaction or resumable idempotent job.
- Record the importer, template version, result, and counts in `import_jobs` and `audit_logs`.
- Keep raw uploads private and apply a documented retention/deletion policy.

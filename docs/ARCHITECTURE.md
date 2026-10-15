# CampusSphere architecture and security baseline

This document records the current engineering decision for the prototype. It is deliberately written so the team can explain the system to a reviewer without treating a prototype as production-ready student-information software.

## Decision summary

CampusSphere will begin as a **Next.js + TypeScript Progressive Web App** backed by **Supabase Auth, PostgreSQL, Row Level Security, and private Storage**.

### Why this fits the requirements

- One responsive codebase reaches phones, tablets, laptops, and desktops.
- A PWA can be installed to a device home screen and can receive web updates without waiting for app-store review.
- Supabase provides a managed PostgreSQL database, authentication, storage, and database-level authorization primitives without the team having to build those foundations during a 10-day sprint.
- PostgreSQL gives us relationships, constraints, transactions, migrations, indexes, and reporting for clubs, events, and attendance.
- RLS can enforce college-level isolation even if a client request is manipulated.
- A future native app can consume the same backend and policies; it should not create a second permission model.

### Important boundary

This stack improves the security starting point; it does not make CampusSphere secure automatically. We must enforce authorization on the server and in the database, deny access by default, test allow/deny cases, minimize data collection, protect uploaded files, and review the deployment before importing real records.

## Product surfaces

### Web/PWA for the prototype

- **Student surface:** dashboard, club discovery, club detail, membership status, events, and personal attendance.
- **Club leader surface:** assigned clubs, membership requests, event and achievement management, and attendance for their events.
- **College administrator surface:** import jobs, student/club/event management, leader assignment, attendance reporting, and audit history.
- **Shared shell:** responsive navigation, search, notifications, profile, help, and light/dark theme preference.

### Later native apps

When the product has validated workflows, a React Native/Expo or Capacitor client can reuse the backend. Native apps are a later phase because building and signing iOS and Android applications in the first 10 days would split the team and slow down security testing. The PWA is the mobile app for the hackathon milestone.

## Logical architecture

```text
Browser / installed PWA
        |
        | HTTPS, Supabase session cookies, validated requests
        v
Next.js App Router
  - responsive UI and route guards
  - server actions / route handlers
  - import validation and audit orchestration
        |
        +---- Supabase Auth (identity and sessions)
        +---- PostgreSQL (constraints, RLS, migrations)
        +---- Supabase Storage (private imports and permitted media)
        |
        v
GitHub Actions -> lint -> typecheck -> tests -> production build
```

The browser may use the public Supabase client only for operations covered by RLS. A server-only secret/service key may be used for controlled import orchestration, but it must never be sent to the browser, placed in `NEXT_PUBLIC_*`, committed, or exposed in logs.

## Core data model

Every tenant-owned record must be traceable to a `college_id`. The database should use UUID primary keys and explicit foreign keys.

### Tenants and identity

- `colleges`: institution identity, status, display settings, created timestamp.
- `profiles`: non-auth profile data linked to `auth.users`; do not duplicate passwords.
- `college_memberships`: user-to-college relationship, role (`admin`, `club_leader`, `student`), status, and timestamps.

A user may belong to more than one college in the model, but the prototype can select one active college at a time. The active college must be checked against database membership, not trusted from a URL, hidden form field, or editable spreadsheet column.

### Engagement data

- `clubs`: `college_id`, name, slug, category, description, status, contact details, and visibility.
- `club_memberships`: student, club, status (`pending`, `approved`, `rejected`, `left`), reviewer, and timestamps.
- `club_roles`: explicit club-level relationships such as president, secretary, faculty advisor, and term dates.
- `events`: college, club, creator, title, location, start/end, visibility, capacity, and publication status.
- `event_attendance`: event, student, attendance status, recorded by, and recorded timestamp.
- `courses`: college, code, title, department, term, and status.
- `course_enrolments`: course, student, term, and status.
- `class_sessions`: course, instructor reference, start/end, room, and status.
- `class_attendance`: class session, student, attendance status, recorded by, and recorded timestamp.
- `achievements`: college, club, title, description, date, evidence reference, and publication status.

### Imports, files, and audit

- `import_jobs`: college, uploader, source filename metadata, template version, status, counts, and timestamps.
- `import_rows`: import job, row number, entity type, normalized values, validation status, and non-sensitive error messages. Do not retain raw uploads longer than needed.
- `stored_files`: owner college, storage object key, purpose, content type, size, checksum, and retention status.
- `audit_logs`: actor, college, action, entity type/id, outcome, request correlation id, and timestamp. Never put passwords, access tokens, or full sensitive row contents in logs.

Attendance is intentionally separated by context. A student should see their own event and class attendance; a club leader should see attendance for events they are authorised to manage; an administrator should see permitted college-level reports. Classroom attendance is never visible to a club leader through a general college role.

## Permission model

Use coarse roles for navigation and fine-grained relationship checks for data actions. In other words, combine RBAC with college and resource relationships.

| Resource/action | Student | Club leader | College admin |
|---|---:|---:|---:|
| View published clubs in own college | Yes | Yes | Yes |
| View private college/student records | Own permitted records | Assigned club/event only | Permitted college records |
| Request club membership | Yes | Yes, as a student if applicable | Yes, if explicitly supported |
| Approve membership requests | No | Assigned club | Any club in own college |
| Create/edit club profile | No | Assigned club fields | Own college |
| Create/edit events | No | Assigned club | Own college |
| Record event attendance | No | Assigned event | Own college |
| View personal attendance | Own only | Own only | Own only unless reporting permission |
| View event attendance report | Own rows | Assigned events | Own college |
| View class attendance report | Own rows | No | Own college |
| Import students/clubs/events | No | No | Own college |
| Assign college roles | No | No | Restricted admin workflow |
| Read audit history | No | Own relevant actions only | Own college |

These are product rules, not merely UI rules. Hiding a menu item is not authorization.

## Security baseline

### Tenant isolation

1. Add `college_id` to every college-owned table.
2. Derive the caller identity from the authenticated session.
3. Resolve the caller's college membership and role inside trusted server/database logic.
4. Enable RLS on every exposed table and write separate policies for each operation.
5. Deny by default; grant only the operations needed by `anon` and `authenticated` roles.
6. Test both a permitted user and a same-role user from another college.
7. Never use a client-supplied `college_id` as proof of tenancy.

### Authentication and sessions

- Use Supabase Auth for the prototype rather than implementing password storage.
- Use secure, HTTP-only session handling through the Next.js/Supabase SSR integration.
- Keep admin onboarding invite-based; do not send or import plaintext passwords.
- Add MFA for administrators before any real deployment.
- Revoke sessions and review role changes through an auditable workflow.

### Excel and file imports

The import flow is:

```text
upload -> file checks -> parse -> map template -> validate -> preview -> confirm -> transaction -> audit
```

Required controls:

- Accept only the documented `.xlsx` template for the first milestone; reject unexpected extensions and oversized files.
- Check file size, filename, content type, and parser errors on the server.
- Generate a server-side storage key; never use the user filename as a path.
- Store private uploads outside public web paths and provide only short-lived authorized access.
- Limit columns and row counts for the prototype to reduce denial-of-service risk.
- Validate required fields, email format, enum values, dates, duplicate identifiers, and existing records.
- Do not let spreadsheet columns assign college ownership or privileged roles.
- Treat formulas and cells beginning with `=`, `+`, `-`, or `@` as unsafe text for fields that will ever be exported. Sanitize exports to prevent CSV/formula injection.
- Show row-level errors without exposing other colleges' data.
- Commit valid records only after the administrator confirms the preview. Make the operation idempotent where possible.
- Retain import metadata and an audit result; delete raw files according to a documented retention policy.

### Sensitive data minimization

For the prototype use synthetic records. Only collect fields required for a demonstrated workflow. Avoid government IDs, home addresses, health information, grades, and unrelated contact details. Attendance should be treated as private student data, with narrow access and no public URLs.

### API, storage, and browser protections

- Validate request bodies with a schema at the server boundary.
- Use parameterized database queries and database constraints.
- Keep service-role keys and other secrets server-side.
- Add security headers, HTTPS, CSRF protections appropriate to the session design, and a restrictive Content Security Policy before deployment.
- Do not render user-entered descriptions as unsafe HTML.
- Rate-limit authentication, imports, membership requests, and event creation before production.
- Use private storage buckets and signed URLs for permitted media.
- Log security-relevant actions with minimal data and a correlation id.
- Keep dependencies updated and use automated vulnerability alerts.

## Responsive and visual system

The interface should feel like one product on every screen size:

- **Desktop:** left navigation rail, top search/actions, content workspace, optional right-side detail panel.
- **Mobile:** compact top bar, drawer navigation, bottom navigation for the most common student actions, stacked cards, and touch-sized controls.
- **Themes:** light and dark tokens for background, surface, border, text, accent, success, warning, and danger. Respect the operating-system preference and provide an explicit toggle.
- **Information architecture:**
  - Student: Home, Discover, My Clubs, Events, Attendance, Profile.
  - Club leader: Overview, My Clubs, Requests, Events, Attendance, Achievements.
  - Admin: Overview, Imports, Students, Clubs, Events, Attendance, Audit, Settings.
- **Accessibility:** keyboard navigation, visible focus, semantic headings, labelled controls, readable contrast in both themes, and no color-only status indicators.

## Change and deployment strategy

- Keep database migrations in version control and apply them in order.
- Use feature branches or small pull requests; protect `main` when the team is ready.
- Run lint, typecheck, unit tests, authorization/integration tests, and production build in GitHub Actions.
- Use preview deployments for UI changes and synthetic seed data only.
- Keep dev, preview, and production Supabase projects separate before handling real records.
- Prefer backward-compatible migrations so web clients can be updated independently.
- Record important architectural decisions in this document and the Gemini Notebook after each major milestone.

## Scope boundaries

### In the 10-day prototype

- Responsive PWA with light/dark themes.
- Three roles and one or two synthetic colleges.
- Student, club, event, and attendance import/demo workflows.
- Membership request and approval flow.
- Server/database authorization and cross-college denial tests.
- Private file handling and a small audit trail.

### After the prototype

- Native app-store clients.
- SSO with college identity providers.
- Administrator MFA enforcement and recovery operations.
- Background imports for very large files.
- Notification preferences and push delivery.
- Advanced attendance verification such as QR or device-based check-in.
- Retention/deletion automation, formal threat modelling, penetration testing, accessibility audit, and institutional privacy/compliance review.

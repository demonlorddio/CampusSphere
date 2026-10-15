# CampusSphere 10-day delivery plan

## Goal

Deliver a credible, secure prototype that demonstrates two connected admin-to-student data flows:

1. **Engagement flow:** college admin imports clubs/events, a student discovers a club, requests membership, and a club leader approves it.
2. **Attendance flow:** college admin imports or records event and classroom attendance, and the correct user sees the correct limited view.

The prototype uses synthetic data. Real student data must not be uploaded until institutional privacy, retention, access, backup, incident response, and deployment reviews are complete.

## Scope guardrails

### Must work

- Responsive PWA shell on mobile and desktop.
- Light/dark theme toggle with accessible contrast.
- Authenticated demo accounts for college admin, club leader, and student.
- One or two synthetic colleges with server/database tenant isolation.
- Validated Excel import preview for students, clubs, events, and attendance rows.
- Club discovery and membership request/approval.
- Events and club achievements.
- Event attendance and basic classroom attendance.
- Automated authorization tests for same-college allow and cross-college deny cases.
- README, architecture, import templates, demo script, and setup instructions.

### Explicitly defer

- Native App Store/Play Store binaries.
- Daily timetable generation, faculty payroll, grades, fees, or full ERP integration.
- QR/biometric attendance.
- Live chat, payments, social feed, complex recommendations, and production-scale background processing.
- Real college data, sensitive identifiers, or claims of compliance/certification.

## Day-by-day plan

| Day | Focus | Completion evidence |
|---|---|---|
| 1 | Confirm UX flows, threat boundaries, schema, and synthetic demo data | Architecture and acceptance criteria agreed; repository setup documented |
| 2 | Create Next.js app shell, design tokens, responsive navigation, theme system | Student/admin shell renders at mobile and desktop widths |
| 3 | Configure Supabase clients, auth flow, profiles, colleges, memberships, and RLS foundation | Demo users can sign in; unauthorised route/data access is denied |
| 4 | Add core schema and seed data for clubs, courses, events, sessions, and attendance | Database migration and synthetic seed can be rerun |
| 5 | Build admin import flow for one template with server validation and preview | Invalid email, duplicate ID, bad enum, formula-like value, and cross-college row are flagged |
| 6 | Build club directory, club detail, event list, membership request, and approval | Student request appears to the correct club leader and can be approved |
| 7 | Build attendance surfaces for event and class contexts | Student sees own records; leader sees assigned event records; admin sees college report |
| 8 | Add achievements, audit events, private file handling, loading/error/empty states | Important writes are auditable; uploaded evidence is not publicly exposed |
| 9 | Integration test, responsive polish, accessibility pass, security review, demo data reset | Critical tests pass; demo can be reset and repeated |
| 10 | Deploy preview, rehearse, record screenshots/video, freeze scope | Working deployed demo, 3-minute script, backup local demo, known gaps listed |

## Team split

- **Frontend/product lead:** responsive shell, navigation, themes, student flows.
- **Admin/leader UI lead:** import screens, club/event/attendance management.
- **Backend/security lead:** Supabase setup, schema, RLS, auth/session boundaries.
- **Data/import lead:** templates, parsing, validation, preview/confirm flow, seed data.
- **Integration/quality lead:** test matrix, accessibility, deployment, demo script, documentation, and cross-feature integration.

Pair on any security-sensitive change. No single person should be the only reviewer for RLS, role assignment, or import confirmation.

## Demo script

1. Open CampusSphere on a phone-sized viewport and switch between light and dark themes.
2. Sign in as a college admin and upload a synthetic workbook containing valid rows plus one duplicate, invalid email, and formula-like text.
3. Show validation errors, correct them, confirm the import, and show the audit result.
4. Sign in as a student from the same college, discover a robotics club, open its event, and request membership.
5. Sign in as the club leader, approve the request, record event attendance, and show the changed status.
6. Return to the student dashboard and show the student's event attendance and class attendance.
7. Attempt to open a second college's club/attendance record and show an intentional denial.

## Checks to run

From the repository root, the intended checks are:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Database policy tests should be run with the Supabase CLI when it is configured:

```bash
supabase test db
```

Until the app scaffold and dependencies exist, these commands are planned checks, not passing checks. The handoff must record the actual output and any missing service or environment variable.

## Major-update documentation rule

After each major milestone—architecture, schema/auth, import workflow, membership/events, attendance, deployment—update:

1. the relevant repository document;
2. the Gemini Notebook with a concise explanation, decisions, current screenshots/video if useful, and links to authoritative sources;
3. the README status section if the user-visible behavior changed.

Never put secrets, real student data, access tokens, or private credentials in the repository or Notebook.

## Progress after architecture milestone

- Repository scaffold exists with Next.js, TypeScript, Tailwind CSS, responsive PWA-style shell, role previews, and theme toggle.
- Supabase migration exists with the core college, engagement, event attendance, class attendance, import, file, and audit tables.
- RLS policy definitions and synthetic pgTAP policy tests exist, but they have not run because no local Supabase database is configured.
- Live Supabase Auth/client integration and the real import/attendance UI remain intentionally unimplemented.

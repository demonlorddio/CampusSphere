# Gemini Notebook update 001 — project direction

Date: 2026-10-13

## CampusSphere decision

CampusSphere is a secure multi-college student engagement platform. College administrators import and maintain structured data; students and club leaders see only the records permitted by their college and relationships.

## Recommended first implementation

- Responsive Next.js + TypeScript PWA for mobile and desktop.
- Supabase Auth for sign-in and sessions.
- PostgreSQL for relational data, migrations, constraints, and reports.
- Row Level Security (RLS) for database-enforced tenant and role boundaries.
- Private storage for imports and permitted media.
- GitHub Actions for repeatable checks.

The PWA is the mobile experience for the 10-day prototype. Native iOS/Android apps can later reuse the same backend; they are not part of the first milestone.

## Prototype roles

- **College administrator:** manages own-college students, clubs, courses, events, imports, attendance, and audit history.
- **Club leader:** manages assigned clubs/events, membership requests, achievements, and event attendance.
- **Student:** discovers published clubs/events, requests membership, and sees their own event and classroom attendance.

## Attendance decision

The product includes both:

- **Event attendance:** club workshops, meetings, and campus events.
- **Class attendance:** courses, enrolments, class sessions, and attendance records.

For the prototype, class attendance is admin-managed and imported or recorded from synthetic data. Club leaders do not receive classroom attendance access. QR, biometric, timetable, and ERP integrations are later work.

## Primary end-to-end demo

Admin upload → server validation and preview → confirmed database import → student discovers club → membership request → leader approval → event/class attendance views → cross-college access denied.

## Security principles

- Every tenant-owned record has a `college_id`.
- Server/database policies derive college and role from the authenticated user; no client-supplied college ID is trusted.
- RLS is enabled and tested for every exposed table; deny by default.
- Import files are size/type checked, parsed server-side, previewed before commit, and stored privately.
- Do not import or store plaintext passwords.
- Protect exports against CSV/formula injection.
- Use synthetic data until the institution approves real-data handling.
- Keep attendance private and log security-sensitive actions without tokens or raw sensitive rows.

## 10-day scope

Day 1 requirements/schema; Day 2 shell/themes; Day 3 auth/RLS; Day 4 schema/seeds; Day 5 imports; Day 6 clubs/membership/events; Day 7 event/class attendance; Day 8 achievements/audit/files; Day 9 tests/accessibility/security; Day 10 deployment and demo rehearsal.

## Sources to keep in the Notebook

Prefer authoritative or directly relevant sources:

- Next.js PWA guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase SSR Auth guide: https://supabase.com/docs/guides/auth/server-side/advanced-guide
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- OWASP Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP CSV Injection: https://owasp.org/www-community/attacks/CSV_Injection

Remove duplicates, failed links, generic image inspiration, Wikipedia/Scribd copies, and sources that do not directly inform CampusSphere requirements. Keep research sources separate from project decisions; Notebook AI summaries must be checked against the linked original source.

## Next Notebook artifact

Create a concise 3–5 minute CampusSphere overview covering the problem, three roles, two attendance contexts, import preview, RLS/tenant isolation, responsive PWA, and the 10-day prototype boundary. It should state clearly that it is a prototype using synthetic data.

## Repository documentation created with this update

- `README.md` — product direction and MVP acceptance criteria.
- `docs/ARCHITECTURE.md` — logical architecture, entities, permissions, security baseline, responsive UX, and scope boundaries.
- `docs/10-DAY-PLAN.md` — day-by-day work plan, team split, demo script, and actual-check expectations.
- `docs/IMPORT-TEMPLATES.md` — spreadsheet columns and validation rules for students, clubs, events, event attendance, courses, enrolments, class sessions, and class attendance.
- `docs/ENGINEERING-STANDARDS.md` — installed UI/UX, React/Next.js, Supabase/Postgres skills and the security/accessibility sources they follow.

Installed skill sources are pinned in `skills-lock.json`. The project uses the
Taste Skill selectively for visual discipline, Vercel/Anthropic frontend rules
for UI reviews, Vercel React guidance for performance, and Supabase's official
skills for Auth/Postgres/RLS work. No third-party skill's optional scripts have
been treated as security proof.

The Gemini Notebook should mirror these decisions after the notebook tab is available for editing. Do not paste credentials or real college data into it.

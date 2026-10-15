# CampusSphere

CampusSphere is a secure, multi-college student engagement platform for importing college data, discovering clubs, managing memberships, publishing events, recording attendance, and preserving achievements across academic years.

## Recommended product shape

CampusSphere will start as a responsive **Progressive Web App (PWA)**. This gives students and administrators an installable, app-like experience on phones, tablets, and computers from one codebase. A future native iOS/Android client can reuse the same backend and authorization model; native store apps are intentionally outside the 10-day prototype.

## Recommended stack

- **Next.js + TypeScript:** one web and server application with responsive routing, server-side controls, and a maintainable foundation.
- **Tailwind CSS + an accessible component system:** fast, consistent light/dark themes and responsive layouts.
- **Supabase:** managed PostgreSQL, authentication, private storage, and database Row Level Security (RLS).
- **GitHub Actions:** repeatable lint, typecheck, test, and build checks on every change.

The stack is a recommendation based on the current requirements, not a claim that a framework alone makes the product secure. Authorization must be enforced in the database and server, tested, logged, and reviewed before real student data is used.

## Prototype goal

Build a 10-day MVP for three roles:

- **College administrator:** imports students, manages clubs, assigns club leaders, and views college-level data.
- **Club leader:** manages a club profile, reviews membership requests, and publishes events and achievements.
- **Student:** discovers clubs, views leaders and activities, requests membership, and tracks memberships and events.

## Primary demo flow

1. An administrator uploads a student Excel file.
2. CampusSphere previews valid rows and flags invalid or duplicate rows.
3. A student signs in and discovers a club.
4. The student requests membership.
5. The club leader approves the request.
6. The student's dashboard updates with the membership and upcoming events.
7. A second college account demonstrates tenant isolation.

## MVP acceptance criteria

- Users can sign in with role-aware access.
- A user's college is enforced server-side for private data access.
- Administrators can validate and import a defined Excel template.
- Students can search and filter clubs in their college.
- Students can submit membership requests.
- Club leaders can approve or reject requests for their clubs.
- Club leaders can create events and achievements.
- Students can see their memberships and relevant upcoming events.
- The prototype uses synthetic data and never stores plaintext passwords in spreadsheets.
- College administrators can import clubs, events, and attendance using validated templates or forms.
- Attendance is visible only to authorised administrators, relevant club leaders, and the student’s own account.
- Private uploads use protected storage and time-limited access rather than public file URLs.
- The interface works on mobile and desktop and supports light and dark themes.
- Cross-college access is denied by default and covered by automated authorization tests.

## Documentation

- [Architecture and security](docs/ARCHITECTURE.md)
- [10-day delivery plan](docs/10-DAY-PLAN.md)
- [Import templates and data contract](docs/IMPORT-TEMPLATES.md)
- [Engineering standards and skill registry](docs/ENGINEERING-STANDARDS.md)
- [Supabase setup](docs/SUPABASE-SETUP.md)
- [Gemini Notebook update 001](docs/GEMINI-NOTEBOOK-UPDATE-001.md)
- [Gemini Notebook update 002](docs/GEMINI-NOTEBOOK-UPDATE-002.md)
- [Gemini Notebook update 003](docs/GEMINI-NOTEBOOK-UPDATE-003.md)
- [Gemini Notebook update 004](docs/GEMINI-NOTEBOOK-UPDATE-004.md)

## Run locally

The public demo uses synthetic records and does not need real college data.
After installing dependencies and creating `.env.local` when you want to test
the authenticated Supabase flow, start the local development server with:

```bash
./start.sh
```

Open <http://localhost:3000>. The server runs in the background, writes its
PID to `.local/campussphere-dev.pid`, and writes output to
`.local/campussphere-dev.log`. Stop it with:

```bash
./stop.sh
```

You can choose another port either way:

```bash
./start.sh 3100
./stop.sh
```

The equivalent npm commands are `npm run local:start` and
`npm run local:stop`. Use `npm run dev` directly when you want the normal
foreground Next.js process.

## Current status

The project workspace is initialised at `/home/dio/Projects/CampusSphere` and the `main` branch is connected to the GitHub repository. The current implementation includes a responsive synthetic-data web shell, PWA manifest, light/dark theme support, an interactive role-aware demo with search, notifications, detail panels, a complete local student-to-club-leader membership request and approval flow, and import previews, plus a Supabase/PostgreSQL schema with RLS policy definitions and a real email/password session flow. The linked Supabase project has the initial migration applied and verified with 17 tables, RLS enabled on all 17 tables, 50 policies, and three private helper functions. The authenticated dashboard reads active college memberships through RLS; no real college data or application-created accounts are connected yet. Import processing, membership persistence, events, and attendance screens remain future connected slices.

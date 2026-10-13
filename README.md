# CampusSphere

CampusSphere is a multi-college student engagement platform for discovering clubs, managing memberships, publishing events, and preserving club achievements across academic years.

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

## Current status

Project workspace initialised at `/home/dio/Projects/CampusSphere`.

The application stack is intentionally not selected yet. Choose the stack the team already knows best before adding framework-specific files.

---
name: campussphere-engineering
description: Project-specific playbook for building CampusSphere with intentional responsive UI, accessible workflows, secure multi-tenant Supabase/Postgres data, and repeatable checks.
---

# CampusSphere engineering playbook

Use this skill for any CampusSphere feature, UI review, schema/migration change,
authorization change, import workflow, attendance workflow, or deployment change.
It supplements the available OmniRush setup, feature, test, build, review,
refactor, performance, debug, and handoff skills; it does not replace them.

## Product boundary

CampusSphere is a multi-college student engagement platform. The first product
surface is a responsive Next.js/TypeScript PWA backed by Supabase Auth,
PostgreSQL, Row Level Security (RLS), and private storage.

The three primary roles are:

- **College administrator:** manages the authenticated college's records,
  imports data, assigns club roles, and views permitted reports.
- **Club leader:** manages only assigned clubs and events, membership requests,
  achievements, and event attendance.
- **Student:** discovers permitted clubs and events, requests membership, and
  views only their own event and classroom attendance.

Classroom attendance is a separate academic context. A club-leader role must
not grant access to classroom attendance.

The prototype uses synthetic data. Never connect real student records until
privacy, retention, backup, incident response, deployment, and institutional
review are complete.

## Non-negotiable security rules

1. Every tenant-owned table has a `college_id` and a foreign-key path that
   preserves the college boundary.
2. Derive identity, college membership, and role from the authenticated
   session/database. Never trust a college ID, role, or privileged assignment
   supplied by the browser or spreadsheet.
3. Deny by default. Enforce authorization on every server request and in the
   database; a hidden menu is not an authorization control.
4. Enable RLS on every exposed table. Write policies per operation and test
   same-college allow, cross-college deny, and role/resource relationship cases.
5. Keep service-role keys, database secrets, signing keys, and provider tokens
   server-only. Never commit them, print them, or put them in `NEXT_PUBLIC_*`.
6. Treat attendance, student identifiers, imports, and private evidence files
   as sensitive. Use private storage and short-lived authorized access.
7. Use schema validation, database constraints, parameterized queries, and
   auditable state transitions. Avoid raw HTML rendering of user text.
8. Do not import passwords. Use invitations or supported Auth flows.
9. Apply upload defense in depth: allowlist file type/size, validate the
   parser and structure, generate storage names, limit rows, preview before
   commit, and retain only what the workflow needs.
10. Protect spreadsheet exports from formula/CSV injection. Treat cells that
    begin with `=`, `+`, `-`, `@`, tabs, line breaks, or locale variants as
    unsafe for direct spreadsheet execution.

## UI/UX direction

CampusSphere should feel like a calm, trustworthy campus operations product,
not a generic dashboard template. Use the actual campus domain in the content:
clubs, leaders, events, courses, attendance, imports, and achievements.

Before implementing a major screen, write a short design brief:

- user and job-to-be-done;
- primary action and success state;
- empty, loading, invalid, permission-denied, and failure states;
- mobile and desktop layout behavior;
- one memorable visual choice and the elements that stay quiet around it.

Use deliberate typography, spacing, hierarchy, and color tokens. Do not add
decorative gradients, gratuitous rounded cards, all-caps eyebrows, unexplained
numbered sections, or motion just because they are common AI-generated UI
patterns. One strong visual idea is better than many competing effects.

Use sentence-case, active, specific copy. Buttons should describe the result
(`Review import`, `Approve request`, `Save event`) rather than vague steps
(`Continue`, `Submit`). Error messages state what failed and how to fix it.
Empty states point to the next useful action.

### Responsive requirements

- Desktop: stable navigation, search/actions, dense but readable data views.
- Mobile: drawer or bottom navigation, stacked content, touch-sized controls,
  no horizontal overflow, and safe-area-aware full-bleed surfaces.
- Respect system theme preference and provide an explicit light/dark toggle.
- Keep private data visually distinct from public club/event information.
- Use links for navigation and buttons for actions.
- Use semantic headings and landmarks; add a skip link for long app shells.
- Give icon-only controls accessible names and keep visible focus styles.
- Respect `prefers-reduced-motion`; animate only purposeful state changes.
- Use `Intl.DateTimeFormat` and `Intl.NumberFormat` for displayed values.

## Accessibility and interface review

Target WCAG 2.2 AA practices for the prototype. Check keyboard navigation,
focus order, focus visibility, labels, error association, contrast in both
themes, reduced motion, touch target size, readable text, and non-color-only
status indicators.

For every changed UI file, review against the current Vercel Web Interface
Guidelines before calling the feature complete. In particular check:

- icon labels, form labels, semantic elements, skip link, and live regions;
- no `transition: all`, zoom disabling, or gesture-only actions;
- long text and empty arrays do not break layout;
- stateful filters/tabs have a deep-link or an explicit reason not to;
- loading, saving, and destructive actions have clear feedback and recovery.

## Database and data-access rules

Use the Supabase Postgres best-practices playbook for every SQL change.

- Prefer UUID primary keys plus stable college-scoped external references for
  spreadsheet imports.
- Add constraints for valid state, ownership, time ordering, uniqueness, and
  cross-table college consistency.
- Index foreign keys and columns used in RLS predicates and common filters.
- Keep migrations reproducible and ordered; never edit an already-applied
  migration to change production meaning.
- Keep RLS policy expressions simple and relationship-aware. Use carefully
  scoped `security definer` helpers in an unexposed schema when needed to avoid
  recursive policies; pin `search_path` and schema-qualify names.
- Do not expose service-role access to the client. Use a server route or a
  controlled import job for privileged, confirmed operations.
- Use transactions for confirmed imports and make reruns idempotent where
  possible. Store import counts/errors, not passwords or unnecessary raw rows.
- Keep event attendance and class attendance in separate tables and policies.
- Add an RLS test whenever a table or policy changes.

## Import workflow

Use this state sequence:

```text
upload -> file checks -> parse -> map -> validate -> preview -> confirm ->
transaction/idempotent job -> audit -> retention cleanup
```

The administrator's authenticated college supplies tenancy. The workbook must
not choose the college. Reject unknown columns and oversized/invalid files;
show row-numbered actionable errors; do not leak rows from another college.

## Delivery and evidence

For every meaningful change:

1. State observable acceptance criteria before editing.
2. Make the smallest complete user flow, including failure/empty states.
3. Add or update a test for the important boundary.
4. Run the smallest real checks: lint, typecheck, tests, build, and relevant
   database policy tests.
5. Review the changed UI and security boundary, not just the happy path.
6. Update `README.md` or the relevant `docs/` file.
7. After each major milestone, update the Gemini Notebook with the decision,
   source links, screenshots/video if useful, and known gaps. Never add secrets
   or real student data to the Notebook.

Never claim a feature is production-secure, compliant, or complete because a
button, schema, or policy file exists. Verify the behavior in the real flow.

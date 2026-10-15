# CampusSphere engineering standards and skill registry

This document records the external guidance and local playbooks used for
CampusSphere. It keeps the project reproducible instead of relying on an
unwritten prompt or an agent's memory.

Research checked: 13 October 2026.

## Installed project skills

The following public skills are installed under `.agents/skills/` and pinned in
`skills-lock.json`:

| Skill | Use in CampusSphere | Source |
|---|---|---|
| `design-taste-frontend` | Visual direction, anti-generic design discipline, screenshots and visual review when the required browser tooling exists | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) |
| `frontend-design` | Subject-specific visual decisions, typography, layout, motion restraint, and content quality | [Anthropic skills](https://github.com/anthropics/skills) |
| `web-design-guidelines` | Accessibility and web-interface audit of changed UI files | [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) |
| `vercel-react-best-practices` | Next.js/React performance, server/client boundaries, bundle size, data fetching, and rerender review | [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) |
| `supabase` | Supabase Auth, SSR, Storage, client/server integration, RLS, and CLI guidance | [Supabase agent-skills](https://github.com/supabase/agent-skills) |
| `supabase-postgres-best-practices` | PostgreSQL schema, migrations, indexes, RLS, functions, imports, performance, and policy tests | [Supabase agent-skills](https://github.com/supabase/agent-skills) |
| `campussphere-engineering` | Project-specific product boundary, security invariants, UI direction, import rules, evidence, and Notebook updates | `.opencode/skills/campussphere-engineering/SKILL.md` |

The existing OmniRush best-practice skills remain active for their matching
workflows: setup, feature, test, build, review, refactor, performance, debug,
handoff, and swarm when a swarm is actually needed.

### Skill-selection rule

- UI or responsive layout: `frontend-design` + `design-taste-frontend` as
  appropriate, then `web-design-guidelines` and `vercel-react-best-practices`.
- Auth, storage, imports, RLS, migrations, SQL, or Supabase: `supabase` and
  `supabase-postgres-best-practices` plus `campussphere-engineering`.
- Any security-sensitive change: `campussphere-engineering`, OWASP checklist
  below, relevant implementation skill, and an allow/deny test.
- Bug, build, refactor, performance, or handoff: matching OmniRush skill plus
  the project-specific skill.

The Taste skill is primarily aimed at public-facing pages and explicitly says
it is not a dashboard skill. CampusSphere is an application/dashboard, so its
anti-generic principles are used selectively; they do not override usability,
accessibility, data density, or role-based task clarity.

The Taste inspector expects Node 22+ and Chrome/Edge/Chromium. Node 26 is
available in this workspace, but no Chrome/Chromium executable was found during
setup. Do not claim that its browser inspector has passed until that tooling is
available. We can still use the written visual principles and the existing
responsive preview.

## Security and privacy sources

- [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/) — verification requirements for web application controls.
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) — least privilege, deny-by-default, server-side checks, logging, and authorization tests.
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) — allowlists, file signatures, generated names, private storage, limits, and authorized uploads.
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection) — formula-injection hazards when exporting or re-opening untrusted spreadsheet values.
- [Supabase Auth](https://supabase.com/docs/guides/auth) — authentication and integration with database policies.
- [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — PKCE, cookies, cache boundaries, and Next.js session handling.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — grants, policies, private helpers, indexes, and pgTAP policy tests.
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — default-deny behavior, policy composition, bypass roles, and policy caveats.

### Applied security baseline

- Tenant ownership is derived from authenticated college membership, never from
  browser fields or workbook columns.
- Every exposed table has RLS and explicit grants; service-role access remains
  server-only.
- Event attendance and classroom attendance have separate data and policies.
- Imports are checked, validated, previewed, confirmed, committed safely, and
  audited; raw uploads follow retention rules.
- Synthetic data is required for the prototype.

## UI, accessibility, and product sources

- [Anthropic Frontend Design skill](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md) — deliberate subject-specific visual direction and anti-template review.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill) — visual direction, typography, content substance, and screenshot review.
- [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) — current rules for semantic controls, focus, forms, motion, content handling, responsive behavior, and dark mode.
- [W3C WCAG 2.2 overview](https://www.w3.org/WAI/standards-guidelines/wcag/) — perceivable, operable, understandable, robust accessibility standard.
- [Nielsen Norman Group usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) — visibility of status, real-world language, user control, consistency, error prevention, recognition, and useful help.
- [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — manifest, installability, notifications, and PWA security considerations.

### Applied interface baseline

- Use campus language and real task-oriented copy.
- Keep role-specific menus clear and do not expose irrelevant private data.
- Support mobile and desktop, light and dark themes, keyboard navigation, focus,
  readable contrast, reduced motion, safe-area spacing, and meaningful states.
- Prefer one distinctive visual idea over a collection of generic effects.
- Review the actual page at mobile and desktop widths; do not judge only from
  component source.

## Database and performance sources

- [Supabase Postgres best-practices skill](https://raw.githubusercontent.com/supabase/agent-skills/main/skills/supabase-postgres-best-practices/SKILL.md) — query performance, connection management, security/RLS, schema, locking, data access, monitoring, and advanced features.
- [Vercel React best-practices skill](https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/SKILL.md) — waterfalls, bundles, server performance, client fetching, rerenders, and rendering.
- [Next.js documentation](https://nextjs.org/docs) — framework behavior and supported APIs.

### Applied performance baseline

- Index foreign keys and columns used in RLS predicates.
- Avoid server/client waterfalls and module-level request state.
- Keep authenticated routes private and uncached where session refresh can set
  cookies; do not leak one user's response through a CDN.
- Keep list rendering and import preview responsive; paginate or virtualize
  large datasets when real data is introduced.
- Measure before optimizing production-scale queries.

## Review protocol for future changes

Before merging a major change, the team should be able to answer:

1. What user outcome changed?
2. What are the empty, invalid, denied, and failure states?
3. What college/role/resource boundary applies?
4. Which database policy or server check enforces it?
5. Which test proves allow and deny behavior?
6. Does the UI work in both themes and at mobile/desktop widths?
7. Were `npm run lint`, `npm run typecheck`, `npm run build`, and relevant
   database policy tests actually run?
8. Was `README.md`/`docs/` updated, and should the Gemini Notebook receive a
   milestone update?

## Review and trust boundary

Installed skills are third-party instruction files, not executable proof of
security or accessibility. Review their content before use, keep the lock file,
and do not run their optional scripts without checking what they execute. The
project's own acceptance criteria, tests, source documentation, and actual
runtime checks remain authoritative.

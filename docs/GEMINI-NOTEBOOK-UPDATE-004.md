# Gemini Notebook update 004 — synthetic membership journey

Date: 2026-10-15

> Paste-ready repository note. The Gemini Notebook tab remains paused, so this
> records the update locally without claiming that the external Notebook was
> edited.

## Milestone completed

The public synthetic demo now supports a complete cross-role membership
journey:

```text
Student opens a club
  → requests membership
  → switches to Club Leader
  → reviews the new request
  → approves it
  → switches back to Student
  → sees the club as Member
```

## Behavior

- The Student club detail panel shows `Request to join` for an available club.
- A request is added to the local React state with Maya Chen as the synthetic
  student; duplicate requests are prevented.
- The request appears in the Club Leader request count, queue, search results,
  and synthetic notifications.
- Approving the request removes it from the pending queue, updates the count,
  and records the approved club locally for the current browser session.
- Switching back to Student shows `Member` on the club card and detail panel;
  the request action is no longer offered.
- Multiple clubs can be requested and approved independently.

## Security and data boundary

This remains a public synthetic preview. It does not call Supabase, write
membership rows, send notifications, upload files, or approve real users. A
full browser refresh resets the local journey. The authenticated `/login` and
`/dashboard` paths remain separate and continue to use real session checks and
RLS-backed membership reads.

## Evidence

From `/home/dio/Projects/CampusSphere`:

```text
npm test          passed (5 tests)
npm run lint      passed
npm run typecheck passed
npm run build     passed
git diff --check  passed
```

The next connected milestone is to mirror this flow with authenticated
Supabase rows and RLS tests, using synthetic accounts only.

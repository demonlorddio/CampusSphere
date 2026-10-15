# Database policy checks

`rls_policies.sql` is a pgTAP test file for the Supabase CLI. It creates
synthetic users, colleges, clubs, events, courses, sessions, and attendance
rows inside one transaction, switches to the `authenticated` database role,
asserts same-college reads, asserts cross-college reads return no rows, and
rolls the fixtures back. The email addresses use the reserved `.invalid`
domain and are not real identities.

Run it after starting/configuring a local Supabase project:

```bash
supabase test db
```

The checks cover:

- a student reading a same-college public club and own event/class attendance;
- a student being denied a different college's club and attendance rows;
- an assigned club leader reading assigned event attendance but not classroom
  attendance; and
- a club leader being denied a different college's event attendance.

No live Supabase project is assumed by this repository slice. Until the local
Supabase CLI database is configured, this file is a test definition rather
than a passing test result.

# Supabase setup for CampusSphere

The Supabase project has been created. This guide connects it to the local
CampusSphere repository without exposing credentials in Git or chat.

## 1. Keep the current project

The dashboard shows the project as healthy. The Tokyo region is acceptable for
the hackathon prototype. Do not put production student data into it yet.

The **GitHub: No repository connected** status in the Supabase dashboard does
not mean CampusSphere's GitHub remote is missing. The repository remains:

https://github.com/demonlorddio/CampusSphere

Connecting GitHub inside Supabase is optional and not required for the first
integration.

## 2. Get the safe client settings

In Supabase, open **Project Settings → API** (or use the dashboard's
**Connect** button) and copy:

- Project URL
- Publishable key (the public browser key)

Do **not** copy the `service_role`/secret key into the browser, `.env.example`,
GitHub, or chat. The publishable key is safe to expose in a browser only when
RLS policies are correctly enabled; it is not a replacement for authorization.

## 3. Create the local environment file

From the repository root:

```bash
cp .env.example .env.local
```

Edit `.env.local` locally:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

The repository ignores `.env.local`. Never send its contents in chat.

## 4. Apply the database migration reproducibly

Preferred path, from `/home/dio/Projects/CampusSphere`:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

The login flow may open a browser. If the CLI asks for a database password,
enter it directly in the terminal; do not send it here.

The migration is:

```text
supabase/migrations/20261013000000_initial_schema.sql
```

It creates the CampusSphere schema, constraints, indexes, helper functions,
RLS policies, grants, and triggers. It does not create real or demo student
records.

## 5. Verify in Supabase

After `db push`:

1. Open **Database → Migrations** and confirm the migration is applied.
2. Open **Table Editor** and confirm the core tables exist.
3. Open **Authentication → Users**; no real users are required yet.
4. Check **Database → Policies** for RLS policies.
5. Run the policy tests when a local Supabase test database is available:

```bash
npx supabase test db
```

The current repository has policy-test definitions but no configured local
database yet.

The linked project has now been verified from the repository. The migration
history contains `20261013000000` locally and remotely, and a read-only
verification query confirmed:

- 17 expected public tables;
- RLS enabled on all 17 tables;
- 50 public policies;
- 3 private RLS helper functions;
- no findings from `npx supabase db advisors --linked`.

## 6. Next application integration

The first application integration slice is now present. It includes:

1. Browser and request-scoped server clients using `@supabase/ssr`.
2. Next.js 15 middleware that refreshes sessions with verified `auth.getClaims()`.
3. A password sign-in form at `/login` and a local-session sign-out action.
4. A force-dynamic `/dashboard` that independently verifies the user with
   `auth.getUser()` before reading active college memberships.
5. A single RLS-backed membership query that derives college names and roles
   from the database; the browser cannot choose a college or role.

The remaining application integration work is:

1. Create clearly synthetic Auth users and membership fixtures in a preview or
   local environment; do not create accounts with real student information.
2. Add the import preview/validation flow and controlled server-side commit.
3. Replace the remaining synthetic dashboard interactions with RLS-backed
   club, membership, event, achievement, and attendance workflows.

Do not use the service-role key for ordinary browser requests. Any privileged
import operation must stay in a controlled server route/job and write an audit
record.

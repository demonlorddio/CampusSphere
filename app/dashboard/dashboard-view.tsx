import Link from "next/link";
import {
  groupMembershipsByCollege,
  membershipRoleLabels,
  type ActiveCollegeMembership,
} from "../../lib/auth/memberships";
import SignOutForm from "./sign-out-form";
import RetryButton from "../auth/retry-button";
import ThemeToggle from "../auth/theme-toggle";

type DashboardViewProps = {
  memberships: ActiveCollegeMembership[];
  userEmail: string | null;
};

function maskEmail(email: string | null) {
  if (!email) {
    return "Authenticated account";
  }

  const [localPart, domain] = email.trim().split("@");
  if (!localPart || !domain) {
    return "Authenticated account";
  }

  return `${localPart.slice(0, 1)}${localPart.length > 1 ? "•••" : ""}@${domain}`;
}

function MembershipsEmptyState() {
  return (
    <section className="surface-card p-6 sm:p-8" aria-labelledby="empty-memberships-heading">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e1f3ed] text-[#0d7f78] dark:bg-[#17443e] dark:text-[#9fe5d5]" aria-hidden="true">
        <span className="text-lg font-semibold">—</span>
      </div>
      <h3 className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[#18332e] dark:text-[#edf8f3]" id="empty-memberships-heading">
        No active college memberships
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657874] dark:text-[#a9bdb7]">
        Your account is signed in, but it is not currently connected to an active college membership. Contact your college administrator if you expected access, then try again after the membership is activated.
      </p>
      <RetryButton label="Check membership status again" />
    </section>
  );
}

function MembershipCard({ college }: { college: ReturnType<typeof groupMembershipsByCollege>[number] }) {
  return (
    <li className="surface-card p-5 transition-colors hover:border-[#b9d8cf] dark:hover:border-[#386d63] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#80918c] dark:text-[#8ea9a1]">College</p>
      <h3 className="mt-2 break-words text-xl font-extrabold tracking-[-0.04em] text-[#18332e] dark:text-[#edf8f3]">{college.collegeName}</h3>
      <div className="mt-5 border-t pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#80918c] dark:text-[#8ea9a1]">Active roles</p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Active roles at ${college.collegeName}`}>
          {college.roles.map((role) => (
            <li className="rounded-full bg-[#e4f5ef] px-3 py-1.5 text-xs font-bold text-[#0d716a] dark:bg-[#19483e] dark:text-[#a7e8d8]" key={role}>
              {membershipRoleLabels[role]}
            </li>
          ))}
        </ul>

        <details className="group mt-5 border-t pt-4">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm font-bold text-[#45615a] transition-colors hover:bg-[#f2f8f5] hover:text-[#0d7f78] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0d7f78] focus-visible:outline-offset-2 dark:text-[#b7cbc4] dark:hover:bg-[#1b2b27] dark:hover:text-[#a3e8d7]">
            <span>How access is determined</span>
            <span aria-hidden="true" className="text-lg font-normal leading-none transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="px-2 pt-3 text-xs leading-5 text-[#6a7d76] dark:text-[#a2b7af]">
            These read-only roles come from active membership records for your authenticated session. College and role selection are not controlled by this page.
          </p>
        </details>
      </div>
    </li>
  );
}

export default function DashboardView({ memberships, userEmail }: DashboardViewProps) {
  const colleges = groupMembershipsByCollege(memberships);
  const accountLabel = maskEmail(userEmail);

  return (
    <main className="min-h-screen bg-[#f3f5f1] px-4 pb-12 text-[#13201f] dark:bg-[#0d1212] dark:text-[#ecf5f1] sm:px-6 lg:px-10" id="main-content">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-6 border-b py-7 sm:flex-row sm:items-start sm:justify-between sm:py-9">
          <div>
            <Link aria-label="CampusSphere public demo" className="inline-flex items-center text-sm font-extrabold tracking-[-0.03em] text-[#0d7f78] hover:text-[#096c66] dark:text-[#9fe5d5]" href="/">
              CampusSphere
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e4f5ef] px-2.5 py-1 text-[10px] font-bold text-[#0d716a] dark:bg-[#19483e] dark:text-[#a7e8d8]">Session verified</span>
              <span className="text-xs font-semibold text-[#71827d] dark:text-[#9eb1aa]">
                <span className="sr-only">Signed in account: </span>
                {accountLabel}
              </span>
            </div>
            <p className="muted-label mt-5">Authenticated workspace</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.06em] text-[#143d37] dark:text-[#e9faf4] sm:text-5xl">
              Your active colleges
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#60736e] dark:text-[#a8bcb6] sm:text-base">
              This view is built from the active memberships attached to your current session. No college or role is selected in the browser.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <ThemeToggle />
            <SignOutForm />
          </div>
        </header>

        <section className="pt-8" aria-labelledby="memberships-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="muted-label">Access from Supabase</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] text-[#18332e] dark:text-[#edf8f3]" id="memberships-heading">
                Active memberships
              </h2>
            </div>
            {colleges.length > 0 && (
              <p className="text-sm font-semibold text-[#71827d] dark:text-[#9eb1aa]">
                {colleges.length} {colleges.length === 1 ? "college" : "colleges"}
              </p>
            )}
          </div>

          <div className="mt-5">
            {colleges.length === 0 ? (
              <MembershipsEmptyState />
            ) : (
              <ul className="grid gap-4 md:grid-cols-2" aria-label="Active college memberships">
                {colleges.map((college) => <MembershipCard college={college} key={college.collegeId} />)}
              </ul>
            )}
          </div>
        </section>

        <aside className="mt-8 flex items-start gap-3 rounded-2xl border bg-[#e9f6f1]/75 px-4 py-3.5 dark:bg-[#15352f]/75" aria-label="Prototype data notice">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#cceee2] text-xs font-extrabold text-[#0d7f78] dark:bg-[#1b4c42] dark:text-[#a9eadb]">
            i
          </span>
          <p className="text-xs leading-5 text-[#58766e] dark:text-[#a7c8bf]">
            <strong className="font-bold text-[#315e55] dark:text-[#d1efe7]">Prototype workspace.</strong> Memberships are read-only here and are displayed from the current session. CampusSphere uses synthetic records for this preview.
          </p>
        </aside>

        <footer className="mt-10 flex flex-col gap-2 border-t pt-5 text-sm text-[#71827d] dark:text-[#9eb1aa] sm:flex-row sm:items-center sm:justify-between">
          <p>Access is limited to active college memberships.</p>
          <Link className="font-bold text-[#0d7f78] underline decoration-[#9ed9cd] underline-offset-4 hover:text-[#096c66] dark:text-[#9fe5d5]" href="/">
            Visit the public demo
          </Link>
        </footer>
      </div>
    </main>
  );
}

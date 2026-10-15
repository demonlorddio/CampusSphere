import Link from "next/link";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { StatusCard } from "../auth/status-card";
import ThemeToggle from "../auth/theme-toggle";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function BrandMark() {
  return (
    <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#0d7f78] shadow-[0_8px_18px_-10px_rgba(13,127,120,0.9)]">
      <span className="absolute h-[18px] w-[18px] rounded-[5px] border-[2.5px] border-[#e9f7f2] border-b-transparent" />
      <span className="absolute bottom-[9px] right-[8px] h-[9px] w-[9px] rounded-full border-2 border-[#0d7f78] bg-[#f5a56d]" />
    </span>
  );
}

export default function LoginPage() {
  const isConfigured = getSupabaseConfig() !== null;

  return (
    <main className="min-h-screen bg-[#f3f5f1] px-4 py-8 text-[#13201f] dark:bg-[#0d1212] dark:text-[#ecf5f1] sm:px-6 sm:py-12" id="main-content">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mt-5 flex flex-col gap-10 lg:min-h-[calc(100vh-9rem)] lg:flex-row lg:items-center lg:gap-16">
        <section className="max-w-xl flex-1">
          <header>
            <Link aria-label="CampusSphere home" className="inline-flex items-center gap-3" href="/">
              <BrandMark />
              <span>
                <span className="block text-[15px] font-extrabold tracking-[-0.03em]">CampusSphere</span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7f8e8a] dark:text-[#8da7a1]">Campus, connected</span>
              </span>
            </Link>
          </header>

          <div className="mt-12 max-w-lg lg:mt-20">
            <p className="muted-label">Prototype sign-in</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.065em] text-[#143d37] dark:text-[#e9faf4] sm:text-5xl">
              Your campus, in one calm place.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[#60736e] dark:text-[#a8bcb6]" id="sign-in-description">
              Sign in with the account your college provided to see the active campus memberships connected to your session.
            </p>

            <aside className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border bg-[#e6f5ef]/80 p-4 dark:bg-[#15352f]/80" aria-label="Prototype data notice">
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#cceee2] text-sm font-extrabold text-[#0d7f78] dark:bg-[#1b4c42] dark:text-[#a9eadb]">
                i
              </span>
              <div>
                <p className="text-sm font-bold text-[#214e46] dark:text-[#d4f3eb]">Prototype environment</p>
                <p className="mt-1 text-xs leading-5 text-[#58766e] dark:text-[#a7c8bf]">
                  Use a demo account provided by the project maintainer. The campus records in this preview are synthetic.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section aria-label="CampusSphere sign-in" className="w-full max-w-md shrink-0 lg:ml-auto">
          {isConfigured ? (
            <div className="surface-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="muted-label">Welcome back</p>
                <span className="rounded-full bg-[#e6f5ef] px-2.5 py-1 text-[10px] font-bold text-[#0d716a] dark:bg-[#19483e] dark:text-[#a7e8d8]">Secure session</span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] text-[#18332e] dark:text-[#edf8f3]" id="sign-in-heading">
                Sign in to continue
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#657874] dark:text-[#a9bdb7]" id="sign-in-description">
                Use your college email and current password. Access is checked against your active memberships.
              </p>
              <LoginForm />
            </div>
          ) : (
            <StatusCard
              actionHref="/"
              actionLabel="View the public demo"
              description="The authenticated workspace needs the public Supabase project settings before sign-in can be enabled. Ask the project maintainer to configure them, then return here."
              eyebrow="Setup needed"
              title="Sign-in is not configured yet"
            />
          )}

          <p className="mt-6 text-center text-sm text-[#71827d] dark:text-[#9eb1aa]">
            Looking around first?{" "}
            <Link className="font-bold text-[#0d7f78] underline decoration-[#9ed9cd] underline-offset-4 hover:text-[#096c66] dark:text-[#9fe5d5]" href="/">
              Explore the public demo
            </Link>
          </p>
        </section>
      </div>
      </div>
    </main>
  );
}

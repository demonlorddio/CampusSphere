import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusCard } from "../auth/status-card";
import ThemeToggle from "../auth/theme-toggle";
import { isMissingAuthSessionError } from "../../lib/auth/errors";
import { readActiveCollegeMemberships } from "../../lib/auth/memberships";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { createClient } from "../../lib/supabase/server";
import DashboardView from "./dashboard-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function DashboardStatus({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-screen bg-[#f3f5f1] px-4 py-10 text-[#13201f] dark:bg-[#0d1212] dark:text-[#ecf5f1] sm:px-6 sm:py-16" id="main-content">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <StatusCard
          actionKind="retry"
          actionHref="/dashboard"
          actionLabel="Try again"
          description={description}
          eyebrow="Workspace unavailable"
          title={title}
          tone="error"
        />
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[#71827d] dark:text-[#9eb1aa]">
          <Link className="font-bold text-[#0d7f78] underline decoration-[#9ed9cd] underline-offset-4 hover:text-[#096c66] dark:text-[#9fe5d5]" href="/">
            Visit the public demo
          </Link>
        </p>
      </div>
    </main>
  );
}

function SetupState() {
  return (
    <main className="min-h-screen bg-[#f3f5f1] px-4 py-10 text-[#13201f] dark:bg-[#0d1212] dark:text-[#ecf5f1] sm:px-6 sm:py-16" id="main-content">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <StatusCard
          actionHref="/login"
          actionLabel="Return to sign in"
          description="The protected workspace needs the public Supabase project settings before it can verify your session. Ask the project maintainer to configure them, then sign in again."
          eyebrow="Setup needed"
          title="The campus workspace is not configured"
        />
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[#71827d] dark:text-[#9eb1aa]">
          <Link className="font-bold text-[#0d7f78] underline decoration-[#9ed9cd] underline-offset-4 hover:text-[#096c66] dark:text-[#9fe5d5]" href="/">
            Visit the public demo
          </Link>
        </p>
      </div>
    </main>
  );
}

export default async function DashboardPage() {
  if (!getSupabaseConfig()) {
    return <SetupState />;
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return <DashboardStatus title="We couldn't connect to the campus workspace" description="The campus service is temporarily unavailable. Try again in a moment." />;
  }

  let userResult: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    userResult = await supabase.auth.getUser();
  } catch {
    return <DashboardStatus title="We couldn't verify your session" description="Your session could not be checked right now. Try again to reconnect securely." />;
  }

  const user = userResult.data.user;
  if (!user) {
    if (userResult.error && !isMissingAuthSessionError(userResult.error)) {
      return <DashboardStatus title="We couldn't verify your session" description="Your session could not be checked right now. Try again to reconnect securely." />;
    }

    redirect("/login");
  }

  if (userResult.error) {
    return <DashboardStatus title="We couldn't verify your session" description="Your session could not be checked right now. Try again to reconnect securely." />;
  }

  try {
    const memberships = await readActiveCollegeMemberships(supabase, user.id);
    return <DashboardView memberships={memberships} userEmail={user.email ?? null} />;
  } catch {
    return <DashboardStatus title="We couldn't load your memberships" description="Your session is active, but the college memberships could not be loaded. Try again without changing your access details." />;
  }
}

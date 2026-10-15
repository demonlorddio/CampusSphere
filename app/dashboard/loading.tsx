import ThemeToggle from "../auth/theme-toggle";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f3f5f1] px-4 pb-12 text-[#13201f] dark:bg-[#0d1212] dark:text-[#ecf5f1] sm:px-6 lg:px-10" id="main-content">
      <div aria-busy="true" aria-live="polite" className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-6 border-b py-7 sm:flex-row sm:items-start sm:justify-between sm:py-9">
          <div className="w-full max-w-2xl space-y-4">
            <div className="h-4 w-32 rounded-full bg-[#dce9e4] dark:bg-[#1b2d29]" />
            <div className="h-12 max-w-sm rounded-2xl bg-[#dce9e4] dark:bg-[#1b2d29]" />
            <div className="h-4 max-w-xl rounded-full bg-[#e6eeea] dark:bg-[#20312d]" />
            <div className="h-4 max-w-md rounded-full bg-[#e6eeea] dark:bg-[#20312d]" />
          </div>
          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <ThemeToggle />
            <div className="h-11 w-24 rounded-xl bg-[#e6eeea] dark:bg-[#20312d]" />
          </div>
        </header>

        <section aria-label="Loading memberships" className="pt-8">
          <p className="muted-label">Loading workspace</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="surface-card h-56 p-6" />
            <div className="surface-card h-56 p-6" />
          </div>
          <p className="sr-only">Verifying your session and loading active college memberships.</p>
        </section>
      </div>
    </main>
  );
}

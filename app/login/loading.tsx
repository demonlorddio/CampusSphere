import ThemeToggle from "../auth/theme-toggle";

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-[#f3f5f1] px-4 py-8 text-[#13201f] dark:bg-[#0d1212] dark:text-[#ecf5f1] sm:px-6 sm:py-12" id="main-content">
      <div aria-busy="true" aria-live="polite" className="mx-auto w-full max-w-6xl">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="mt-5 grid gap-10 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-center lg:gap-16">
          <div>
            <div className="h-10 w-40 rounded-[14px] bg-[#dce9e4] dark:bg-[#1b2d29]" />
            <div className="mt-20 max-w-lg space-y-4">
              <div className="h-3 w-28 rounded-full bg-[#dce9e4] dark:bg-[#1b2d29]" />
              <div className="h-14 max-w-md rounded-2xl bg-[#dce9e4] dark:bg-[#1b2d29]" />
              <div className="h-14 max-w-sm rounded-2xl bg-[#dce9e4] dark:bg-[#1b2d29]" />
            </div>
          </div>
          <section aria-label="Loading sign-in" className="surface-card space-y-5 p-6 sm:p-8">
            <p className="muted-label">Loading sign-in</p>
            <div className="h-8 w-56 rounded-xl bg-[#dce9e4] dark:bg-[#1b2d29]" />
            <div className="h-4 w-full rounded-full bg-[#e6eeea] dark:bg-[#20312d]" />
            <div className="h-12 w-full rounded-xl bg-[#e6eeea] dark:bg-[#20312d]" />
            <div className="h-12 w-full rounded-xl bg-[#e6eeea] dark:bg-[#20312d]" />
            <p className="sr-only">Preparing the CampusSphere sign-in form.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

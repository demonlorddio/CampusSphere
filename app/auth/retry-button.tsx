"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RetryButton({ label }: { label: string }) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <button
        aria-busy={isRefreshing}
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0d7f78] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_-12px_rgba(13,127,120,0.9)] transition-colors hover:bg-[#096c66] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRefreshing}
        onClick={handleRefresh}
        type="button"
      >
        {isRefreshing ? "Refreshing…" : label}
      </button>
      <span aria-live="polite" className="sr-only">
        {isRefreshing ? "Refreshing the current session and membership data." : ""}
      </span>
    </>
  );
}

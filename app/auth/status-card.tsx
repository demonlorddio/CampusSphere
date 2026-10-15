import Link from "next/link";
import RetryButton from "./retry-button";

type StatusCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  actionKind?: "link" | "retry";
  tone?: "neutral" | "error";
};

export function StatusCard({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  actionKind = "link",
  tone = "neutral",
}: StatusCardProps) {
  const isError = tone === "error";

  return (
    <section
      aria-live={isError ? "assertive" : "polite"}
      aria-describedby="status-card-description"
      aria-labelledby="status-card-title"
      className="surface-card mx-auto w-full max-w-2xl p-6 sm:p-8"
      role={isError ? "alert" : "status"}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e1f3ed] text-[#0d7f78] dark:bg-[#17443e] dark:text-[#9fe5d5]">
        <span aria-hidden="true" className="text-lg font-semibold">
          {isError ? "!" : "i"}
        </span>
      </div>
      <p className="muted-label mt-6">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] text-[#18332e] dark:text-[#edf8f3] sm:text-3xl" id="status-card-title">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#657874] dark:text-[#a9bdb7]" id="status-card-description">
        {description}
      </p>
      {actionKind === "retry" ? (
        <RetryButton label={actionLabel} />
      ) : (
        <Link
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0d7f78] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_-12px_rgba(13,127,120,0.9)] hover:bg-[#096c66]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      )}
    </section>
  );
}

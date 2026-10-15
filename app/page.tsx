"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  adminActivity,
  adminImports,
  leaderEvents,
  leaderRequests,
  notifications,
  recommendedClubs,
  roleOrder,
  roleProfiles,
  studentEvents,
  type ClubItem,
  type EventItem,
  type IconName,
  type ImportItem,
  type NotificationItem,
  type RequestItem,
  type RoleKey,
  type RoleProfile,
  type Tone,
} from "./data";

type Theme = "light" | "dark";

type DetailTarget =
  | { kind: "event"; item: EventItem }
  | { kind: "club"; item: ClubItem }
  | { kind: "request"; item: RequestItem }
  | { kind: "feedback"; title: string; message: string; context?: string };

type ClubMembershipStatus = "available" | "pending" | "member";

type ImportPanelState = {
  item: ImportItem;
  phase: "review" | "preview-ready";
};

type SearchResult =
  | { kind: "nav"; label: string; icon: IconName; detail: string }
  | { kind: "event"; item: EventItem }
  | { kind: "club"; item: ClubItem }
  | { kind: "request"; item: RequestItem }
  | { kind: "import"; item: ImportItem };

function requestKey(request: Pick<RequestItem, "name" | "club">) {
  return `${request.name}::${request.club}`;
}

const toneStyles: Record<Tone, { icon: string; soft: string; dot: string; bar: string }> = {
  teal: {
    icon: "bg-[#dff4ee] text-[#0d7f78] dark:bg-[#103c38] dark:text-[#72d4c1]",
    soft: "bg-[#e9f8f3] text-[#0d7f78] dark:bg-[#123b36] dark:text-[#8de3d0]",
    dot: "bg-[#0d7f78]",
    bar: "bg-[#0d7f78]",
  },
  coral: {
    icon: "bg-[#fff0e9] text-[#d46c43] dark:bg-[#48271f] dark:text-[#ffae87]",
    soft: "bg-[#fff1e9] text-[#bd5b35] dark:bg-[#48271f] dark:text-[#ffb28d]",
    dot: "bg-[#eb8d61]",
    bar: "bg-[#eb8d61]",
  },
  violet: {
    icon: "bg-[#eeeafd] text-[#7662c9] dark:bg-[#2e2853] dark:text-[#bdb1ff]",
    soft: "bg-[#f0edff] text-[#6c58be] dark:bg-[#302956] dark:text-[#c2b9ff]",
    dot: "bg-[#8a77dd]",
    bar: "bg-[#8a77dd]",
  },
  amber: {
    icon: "bg-[#fff5dc] text-[#b78017] dark:bg-[#453717] dark:text-[#ffd36f]",
    soft: "bg-[#fff6df] text-[#9c6e0e] dark:bg-[#463816] dark:text-[#ffd978]",
    dot: "bg-[#e5b64e]",
    bar: "bg-[#e5b64e]",
  },
};

const iconPaths: Record<IconName, ReactNode> = {
  activity: (
    <>
      <path d="M4 12h3l2.1-6 4.1 12 2.3-6H20" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="m9.5 11.2-1 8 3.5-2 3.5 2-1-8" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
    </>
  ),
  building: (
    <>
      <path d="M4 21h16" />
      <path d="M6 21V5l6-3 6 3v16" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="17" rx="3" />
      <path d="M7 2.5v4M17 2.5v4M3 9.5h18" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  clipboard: (
    <>
      <path d="M9 5h6" />
      <path d="M8 3h8a2 2 0 0 1 2 2v16H6V5a2 2 0 0 1 2-2Z" />
      <path d="M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5M5 21h14" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16v14H4z" />
      <path d="M4 14h4l2 3h4l2-3h4" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 9v12" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  moon: (
    <>
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z" />
      <path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15ZM5 16l.5 1.5L7 18l-1.5.5L5 20l-.5-1.5L3 18l1.5-.5L5 16Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  trend: (
    <>
      <path d="M4 16 9 11l3 3 7-8" />
      <path d="M14 6h5v5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5M5 20h14" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.9M17 14.5a5.5 5.5 0 0 1 3.5 5" />
    </>
  ),
};

function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {iconPaths[name]}
    </svg>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#0d7f78] shadow-[0_8px_18px_-10px_rgba(13,127,120,0.9)]">
        <span className="absolute h-[18px] w-[18px] rounded-[5px] border-[2.5px] border-[#e9f7f2] border-b-transparent" />
        <span className="absolute bottom-[9px] right-[8px] h-[9px] w-[9px] rounded-full border-2 border-[#0d7f78] bg-[#f5a56d]" />
      </div>
      {!compact && (
        <div>
          <p className="text-[15px] font-extrabold tracking-[-0.03em] text-[#162522] dark:text-[#edf7f3]">CampusSphere</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7f8e8a] dark:text-[#8da7a1]">Campus, connected</p>
        </div>
      )}
    </div>
  );
}

function Avatar({ initials, tone = "teal", size = "md" }: { initials: string; tone?: Tone; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-14 w-14 text-sm" };
  const colors = {
    teal: "bg-[#d9f1ea] text-[#0d7069] dark:bg-[#1d4e47] dark:text-[#a5e9d9]",
    coral: "bg-[#ffe5d8] text-[#bd603c] dark:bg-[#5a3025] dark:text-[#ffc1a3]",
    violet: "bg-[#e9e3ff] text-[#6c57ba] dark:bg-[#3c336d] dark:text-[#d0c5ff]",
    amber: "bg-[#ffedbd] text-[#9a6a0b] dark:bg-[#554319] dark:text-[#ffdc7e]",
  };

  return <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizes[size]} ${colors[tone]}`}>{initials}</span>;
}

function Navigation({ profile, activeNav, onSelect }: { profile: RoleProfile; activeNav: string; onSelect: (label: string) => void }) {
  return (
    <nav aria-label={`${profile.label} navigation`} className="space-y-1">
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b9895] dark:text-[#7e9791]">Workspace</p>
      {profile.nav.map((item) => {
        const selected = activeNav === item.label;
        return (
          <button
            aria-current={selected ? "page" : undefined}
            className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
              selected
                ? "bg-[#e2f3ee] text-[#0d716a] dark:bg-[#17443e] dark:text-[#a9eadb]"
                : "text-[#6d7c78] hover:bg-[#f2f6f3] hover:text-[#19312d] dark:text-[#92a9a3] dark:hover:bg-[#1d2826] dark:hover:text-[#e8f5f0]"
            }`}
            key={item.label}
            onClick={() => onSelect(item.label)}
            type="button"
          >
            <Icon name={item.icon} size={17} strokeWidth={selected ? 2 : 1.7} />
            <span className="flex-1">{item.label}</span>
            {item.count && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-white/80 text-[#0d716a] dark:bg-[#0d322e] dark:text-[#a9eadb]" : "bg-[#edf2ef] text-[#7a8a86] dark:bg-[#263430] dark:text-[#a8bbb5]"}`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function Sidebar({ profile, activeNav, onSelect }: { profile: RoleProfile; activeNav: string; onSelect: (label: string) => void }) {
  return (
    <aside className="flex h-full w-[258px] shrink-0 flex-col border-r bg-white/60 px-4 py-5 dark:bg-[#111918]/70">
      <div className="px-2">
        <Logo />
      </div>

      <div className="mt-8 rounded-[20px] border bg-[#f8fbf8] p-3 dark:bg-[#17211f]">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#899894] dark:text-[#8da49e]">Current workspace</p>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dff4ee] text-[#0d7f78] dark:bg-[#174840] dark:text-[#9fe5d5]">
            <Icon name={profile.label === "College Admin" ? "building" : profile.label === "Club Leader" ? "award" : "user"} size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#20332f] dark:text-[#e5f1ed]">{profile.label}</p>
            <p className="truncate text-[11px] text-[#7f8d89] dark:text-[#91a8a2]">{profile.college}</p>
          </div>
          <Icon name="chevron-right" size={15} />
        </div>
      </div>

      <div className="mt-8 flex-1 overflow-y-auto">
        <Navigation activeNav={activeNav} onSelect={onSelect} profile={profile} />
      </div>

      <div className="mt-5 rounded-[20px] bg-[#123d38] p-4 text-[#e7faf4] shadow-[0_18px_30px_-20px_rgba(18,61,56,0.9)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#a7e8d8]"><Icon name="shield" size={16} /></span>
          <span className="rounded-full bg-[#c9f2e6]/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a7e8d8]">Preview</span>
        </div>
        <p className="text-xs font-bold">Prototype mode</p>
        <p className="mt-1 text-[11px] leading-4 text-[#b2d7cf]">Synthetic records only. Your future campus, in a safe preview.</p>
      </div>

      <div className="mt-5 flex items-center gap-2.5 border-t pt-4">
        <Avatar initials={profile.initials} tone={profile.label === "College Admin" ? "violet" : "teal"} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[#24342f] dark:text-[#e7f2ee]">{profile.name}</p>
          <p className="truncate text-[11px] text-[#84928e] dark:text-[#91a8a2]">{profile.college}</p>
        </div>
        <button aria-label="Open profile menu" className="rounded-lg p-1 text-[#8a9995] transition hover:bg-[#eef3ef] hover:text-[#19312d] dark:hover:bg-[#24312e]" type="button">
          <Icon name="more" size={17} />
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ profile, activeNav, onSelect, onClose }: { profile: RoleProfile; activeNav: string; onSelect: (label: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button aria-label="Close navigation" className="absolute inset-0 h-full w-full bg-[#10201d]/40 backdrop-blur-[2px]" onClick={onClose} type="button" />
      <div className="relative flex h-full w-[min(86vw,300px)] flex-col bg-[#fbfdfb] px-4 py-5 shadow-2xl dark:bg-[#111918]">
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button aria-label="Close navigation" className="rounded-xl p-2 text-[#70817c] hover:bg-[#eef3ef] dark:hover:bg-[#22302d]" onClick={onClose} type="button">
            <Icon name="menu" size={20} />
          </button>
        </div>
        <div className="mt-8 flex-1 overflow-y-auto">
          <Navigation activeNav={activeNav} onSelect={(label) => { onSelect(label); onClose(); }} profile={profile} />
        </div>
        <div className="rounded-[20px] bg-[#123d38] p-4 text-[#e7faf4]">
          <p className="text-xs font-bold">Synthetic demo workspace</p>
          <p className="mt-1 text-[11px] leading-4 text-[#b2d7cf]">No live data or sign-in connected.</p>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white/75 text-[#60716c] transition hover:-translate-y-0.5 hover:border-[#b9d8cf] hover:text-[#0d7f78] dark:bg-[#17211f]/80 dark:text-[#a7bbb5] dark:hover:border-[#386d63] dark:hover:text-[#a3e8d7]"
      onClick={onToggle}
      type="button"
    >
      <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
    </button>
  );
}

function OverlayPanel({
  children,
  eyebrow,
  id,
  onClose,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-end sm:p-5">
      <button aria-label={`Close ${title}`} className="absolute inset-0 h-full w-full bg-[#10201d]/45 backdrop-blur-[2px]" onClick={onClose} type="button" />
      <section
        aria-labelledby={`${id}-title`}
        aria-modal="true"
        className="relative flex max-h-[min(760px,calc(100vh-1rem))] w-full flex-col overflow-y-auto rounded-t-[28px] border bg-[#fbfdfb] p-5 shadow-2xl dark:bg-[#111918] sm:max-w-[480px] sm:rounded-[28px] sm:p-7"
        id={id}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="muted-label mb-1.5">{eyebrow}</p>
            <h2 className="text-[22px] font-extrabold tracking-[-0.05em] text-[#1c302b] dark:text-[#edf7f3]" id={`${id}-title`}>{title}</h2>
          </div>
          <button aria-label={`Close ${title}`} autoFocus className="rounded-xl border bg-white/70 p-2 text-[#71817c] transition hover:border-[#9bcec1] hover:text-[#0d7f78] dark:bg-[#1a2724] dark:text-[#a9bbb5] dark:hover:border-[#386d63] dark:hover:text-[#a4e9d9]" onClick={onClose} type="button">
            <Icon name="menu" size={17} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}

function DetailOverlay({
  membershipStatus,
  onApprove,
  onClose,
  onRequestJoin,
  target,
}: {
  membershipStatus: ClubMembershipStatus;
  onApprove: (request: RequestItem) => void;
  onClose: () => void;
  onRequestJoin: (club: ClubItem) => void;
  target: DetailTarget;
}) {
  if (target.kind === "event") {
    const styles = toneStyles[target.item.tone];
    return (
      <OverlayPanel eyebrow="Synthetic event detail" id="event-detail" onClose={onClose} title={target.item.title}>
        <div className={`flex items-center gap-3 rounded-2xl p-3 ${styles.soft}`}>
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[14px] bg-white/70 dark:bg-black/10">
            <span className="text-[9px] font-extrabold tracking-[0.08em]">{target.item.day}</span>
            <span className="text-base font-extrabold leading-4 tracking-[-0.05em]">{target.item.date}</span>
          </div>
          <div>
            <p className="text-[12px] font-extrabold">{target.item.club}</p>
            <p className="mt-1 text-[11px] font-semibold opacity-80">{target.item.time}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white/55 p-3 dark:bg-[#18221f]/60">
            <dt className="muted-label">Location</dt>
            <dd className="mt-1 text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{target.item.location}</dd>
          </div>
          <div className="rounded-2xl border bg-white/55 p-3 dark:bg-[#18221f]/60">
            <dt className="muted-label">Format</dt>
            <dd className="mt-1 text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">Campus club session</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl bg-[#f5faf7] p-4 dark:bg-[#1a2522]">
          <p className="text-[11px] font-bold text-[#526a63] dark:text-[#b3c8c1]">What to expect</p>
          <p className="mt-2 text-[13px] leading-5 text-[#6e7f79] dark:text-[#a9bbb5]">{target.item.description}</p>
        </div>
        <p className="mt-4 text-[10px] font-semibold text-[#8a9994] dark:text-[#869c95]">Synthetic preview · no registration or calendar change is made.</p>
      </OverlayPanel>
    );
  }

  if (target.kind === "club") {
    const styles = toneStyles[target.item.tone];
    const statusLabel = membershipStatus === "member" ? "Member" : membershipStatus === "pending" ? "Request pending" : "Open to join";
    return (
      <OverlayPanel eyebrow="Synthetic club detail" id="club-detail" onClose={onClose} title={target.item.name}>
        <div className="flex items-center gap-3 rounded-2xl border bg-white/55 p-4 dark:bg-[#18221f]/60">
          <Avatar initials={target.item.initials} size="lg" tone={target.item.tone} />
          <div className="min-w-0 flex-1">
            <p className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${styles.soft}`}>{target.item.category}</p>
            <p className="mt-2 text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{target.item.members}</p>
          </div>
          <span aria-label={`Membership status: ${statusLabel}`} className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${membershipStatus === "member" ? "bg-[#e6f6ef] text-[#0d7f78] dark:bg-[#19483e] dark:text-[#9de3d3]" : membershipStatus === "pending" ? "bg-[#fff6df] text-[#9c6e0e] dark:bg-[#463816] dark:text-[#ffd978]" : "bg-[#f2f5f2] text-[#71817c] dark:bg-[#26332f] dark:text-[#adbbb6]"}`}>{statusLabel}</span>
        </div>
        <div className="mt-5 rounded-2xl bg-[#f5faf7] p-4 dark:bg-[#1a2522]">
          <p className="text-[11px] font-bold text-[#526a63] dark:text-[#b3c8c1]">About this club</p>
          <p className="mt-2 text-[13px] leading-5 text-[#6e7f79] dark:text-[#a9bbb5]">{target.item.description}</p>
        </div>
        {membershipStatus === "available" ? (
          <button aria-label={`Request to join ${target.item.name}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d7f78] px-4 py-3 text-[12px] font-bold text-white transition hover:bg-[#096c66]" onClick={() => onRequestJoin(target.item)} type="button">
            <Icon name="plus" size={15} /> Request to join
          </button>
        ) : (
          <div aria-live="polite" className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold ${membershipStatus === "member" ? "bg-[#e9f8f3] text-[#0d7f78] dark:bg-[#123b36] dark:text-[#a5e9d9]" : "bg-[#fff6df] text-[#9c6e0e] dark:bg-[#463816] dark:text-[#ffd978]"}`} role="status">
            <Icon name={membershipStatus === "member" ? "check-circle" : "clock"} size={15} /> {statusLabel}
          </div>
        )}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border bg-white/70 px-4 py-3 text-[12px] font-bold text-[#2e6760] transition hover:border-[#9bcec1] hover:bg-white dark:bg-[#18221f] dark:text-[#bce9de] dark:hover:border-[#386d63] dark:hover:bg-[#1d2b27]" onClick={onClose} type="button">
          Keep exploring
          <Icon name="arrow-up-right" size={14} />
        </button>
        <p className="mt-3 text-center text-[10px] font-semibold text-[#8a9994] dark:text-[#869c95]">Synthetic preview · this membership state stays in local React state and is never written to Supabase.</p>
      </OverlayPanel>
    );
  }

  if (target.kind === "request") {
    return (
      <OverlayPanel eyebrow="Synthetic membership request" id="request-detail" onClose={onClose} title={target.item.name}>
        <div className="flex items-center gap-3 rounded-2xl border bg-white/55 p-4 dark:bg-[#18221f]/60">
          <Avatar initials={target.item.initials} size="lg" tone={target.item.tone} />
          <div>
            <p className="text-[13px] font-extrabold text-[#243731] dark:text-[#e8f4ef]">{target.item.club}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#83918d] dark:text-[#9baea8]">Submitted {target.item.time}</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-[#f5faf7] p-4 dark:bg-[#1a2522]">
          <p className="text-[11px] font-bold text-[#526a63] dark:text-[#b3c8c1]">Applicant context</p>
          <p className="mt-2 text-[13px] leading-5 text-[#6e7f79] dark:text-[#a9bbb5]">{target.item.context}</p>
        </div>
        <button aria-label={`Approve request for ${target.item.name} to join ${target.item.club}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d7f78] px-4 py-3 text-[12px] font-bold text-white transition hover:bg-[#096c66]" onClick={() => onApprove(target.item)} type="button">
          <Icon name="check-circle" size={15} /> Approve request
        </button>
        <p className="mt-3 text-center text-[10px] font-semibold text-[#8a9994] dark:text-[#869c95]">Synthetic preview · approval only changes this local demo.</p>
      </OverlayPanel>
    );
  }

  return (
    <OverlayPanel eyebrow="Synthetic preview feedback" id="feedback-detail" onClose={onClose} title={target.title}>
      <div className="rounded-2xl bg-[#e9f8f3] p-4 dark:bg-[#123b36]">
        <p className="text-[13px] font-bold text-[#0d7f78] dark:text-[#a5e9d9]">{target.message}</p>
        {target.context && <p className="mt-2 text-[12px] leading-5 text-[#52766e] dark:text-[#b0d5cb]">{target.context}</p>}
      </div>
      <p className="mt-5 text-[11px] leading-5 text-[#7a8a85] dark:text-[#a0b3ac]">This public demo uses synthetic records. Nothing is sent to a service or saved to a database.</p>
    </OverlayPanel>
  );
}

function ImportReviewPanel({
  onClose,
  onPreviewReady,
  panel,
}: {
  onClose: () => void;
  onPreviewReady: () => void;
  panel: ImportPanelState;
}) {
  const styles = toneStyles[panel.item.tone];
  const status = panel.phase === "preview-ready" ? "Preview ready" : panel.item.status;
  return (
    <OverlayPanel eyebrow="Synthetic import review" id="import-review" onClose={onClose} title={panel.item.name}>
      <div className="flex items-start gap-3 rounded-2xl border bg-white/55 p-4 dark:bg-[#18221f]/60">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] ${styles.icon}`}><Icon name="file" size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-extrabold text-[#243731] dark:text-[#e8f4ef]">{panel.item.type}</p>
          <p className="mt-1 text-[11px] text-[#83918d] dark:text-[#9baea8]">{panel.item.fileSize} <span className="mx-1">·</span> {panel.item.rows}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${panel.phase === "preview-ready" ? "bg-[#e6f6ef] text-[#0d7f78] dark:bg-[#19483e] dark:text-[#9de3d3]" : styles.soft}`}>{status}</span>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white/55 p-3 dark:bg-[#18221f]/60">
          <dt className="muted-label">Rows detected</dt>
          <dd className="mt-1 text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{panel.item.rows}</dd>
        </div>
        <div className="rounded-2xl border bg-white/55 p-3 dark:bg-[#18221f]/60">
          <dt className="muted-label">Validation</dt>
          <dd className="mt-1 text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{panel.phase === "preview-ready" ? "Preview checked" : "Needs coordinator review"}</dd>
        </div>
      </dl>
      <div className="mt-4 rounded-2xl bg-[#fff6df] p-4 dark:bg-[#463816]">
        <p className="text-[11px] font-bold text-[#8e6813] dark:text-[#ffda76]">Example validation message</p>
        <p className="mt-2 text-[12px] leading-5 text-[#8b722e] dark:text-[#e4ca7d]">{panel.item.validationMessage}</p>
      </div>
      <div className="mt-5 rounded-2xl border border-dashed bg-[#f7faf7] p-4 dark:bg-[#17211f]">
        <p className="text-[11px] font-bold text-[#526a63] dark:text-[#b3c8c1]">Preview only</p>
        <p className="mt-2 text-[12px] leading-5 text-[#74837e] dark:text-[#a5b7b1]">No upload or database write occurs in this public demo. The preview state is kept locally in this panel.</p>
      </div>
      {panel.phase === "review" ? (
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d7f78] px-4 py-3 text-[12px] font-bold text-white transition hover:bg-[#096c66]" onClick={onPreviewReady} type="button">
          <Icon name="upload" size={15} /> Start import preview
        </button>
      ) : (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#e9f8f3] px-4 py-3 text-[12px] font-bold text-[#0d7f78] dark:bg-[#123b36] dark:text-[#a5e9d9]">
          <Icon name="check-circle" size={15} /> Local preview is ready
        </div>
      )}
    </OverlayPanel>
  );
}

function NotificationPopover({ notificationItems, onSelect }: { notificationItems: NotificationItem[]; onSelect: (notification: NotificationItem) => void }) {
  return (
    <div aria-labelledby="notification-popover-title" className="absolute right-0 top-[calc(100%+0.6rem)] z-40 w-[min(92vw,360px)] rounded-[22px] border bg-[#fbfdfb] p-4 shadow-2xl dark:bg-[#111918]" id="notification-popover" role="dialog">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div>
          <p className="muted-label">Synthetic inbox</p>
          <h2 className="mt-1 text-[15px] font-extrabold tracking-[-0.03em] text-[#1c302b] dark:text-[#edf7f3]" id="notification-popover-title">Notifications</h2>
        </div>
        <span className="rounded-full bg-[#e9f8f3] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#0d7f78] dark:bg-[#123b36] dark:text-[#a5e9d9]">Demo</span>
      </div>
      <ul className="mt-2 divide-y divide-[#e8eeea] dark:divide-[#263530]">
        {notificationItems.length > 0 ? notificationItems.map((notification) => (
          <li key={notification.id}>
            <button aria-label={`${notification.title}. ${notification.detail}`} className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#f2f7f4] dark:hover:bg-[#1c2a26]" onClick={() => onSelect(notification)} type="button">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneStyles[notification.tone].dot}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{notification.title}</span>
                <span className="mt-1 block text-[11px] leading-4 text-[#7d8d88] dark:text-[#9db0a9]">{notification.detail}</span>
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-[#9aa8a3] dark:text-[#82968f]">{notification.time}</span>
            </button>
          </li>
        )) : (
          <li className="px-2 py-4 text-center text-[11px] font-semibold text-[#7d8d88] dark:text-[#9db0a9]">No synthetic notifications right now.</li>
        )}
      </ul>
    </div>
  );
}

function SearchPopover({
  clubMembershipStatus,
  onSelect,
  query,
  results,
}: {
  clubMembershipStatus: (club: ClubItem) => ClubMembershipStatus;
  onSelect: (result: SearchResult) => void;
  query: string;
  results: SearchResult[];
}) {
  return (
    <div aria-label="Search results" className="absolute right-0 top-[calc(100%+0.6rem)] z-40 w-[min(92vw,390px)] rounded-[22px] border bg-[#fbfdfb] p-3 shadow-2xl dark:bg-[#111918]" id="search-results" role="listbox">
      <div className="flex items-center justify-between gap-3 px-2 pb-2">
        <p className="muted-label">Search the preview</p>
        <span className="text-[10px] font-semibold text-[#9aa8a3] dark:text-[#82968f]">{results.length} result{results.length === 1 ? "" : "s"}</span>
      </div>
      {results.length === 0 ? (
        <p className="rounded-2xl bg-[#f5faf7] px-3 py-4 text-[12px] font-semibold text-[#70817b] dark:bg-[#1a2522] dark:text-[#a5b7b1]">No demo results for “{query.trim()}”. Try a navigation label, event, club, request, or import.</p>
      ) : (
        <ul className="max-h-[min(60vh,360px)] overflow-y-auto">
          {results.map((result, index) => {
            const title = result.kind === "nav" ? result.label : result.kind === "event" ? result.item.title : result.kind === "club" ? result.item.name : result.kind === "request" ? result.item.name : result.item.name;
            const detail = result.kind === "nav" ? result.detail : result.kind === "event" ? `${result.item.club} · ${result.item.location}` : result.kind === "club" ? `${result.item.category} · ${result.item.members}${clubMembershipStatus(result.item) === "member" ? " · Member" : clubMembershipStatus(result.item) === "pending" ? " · Request pending" : ""}` : result.kind === "request" ? `${result.item.club} · ${result.item.time}` : `${result.item.type} · ${result.item.status}`;
            const icon = result.kind === "nav" ? result.icon : result.kind === "event" ? "calendar" : result.kind === "club" ? "users" : result.kind === "request" ? "inbox" : "file";
            return (
              <li key={`${result.kind}-${title}-${index}`}>
                <button aria-selected="false" className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-[#f2f7f4] dark:hover:bg-[#1c2a26]" onClick={() => onSelect(result)} role="option" type="button">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e9f8f3] text-[#0d7f78] dark:bg-[#123b36] dark:text-[#a5e9d9]"><Icon name={icon} size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{title}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#7d8d88] dark:text-[#9db0a9]">{detail}</span>
                  </span>
                  <Icon name="chevron-right" size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatCard({ stat }: { stat: RoleProfile["stats"][number] }) {
  const styles = toneStyles[stat.tone];
  return (
    <div className="surface-card group p-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_-30px_rgba(30,69,63,0.38)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${styles.icon}`}><Icon name={stat.icon} size={18} /></span>
        <button aria-label={`More about ${stat.label}`} className="rounded-lg p-1 text-[#9aa8a3] opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100 hover:bg-[#f1f5f2] hover:text-[#52645e] dark:hover:bg-[#24302d] dark:hover:text-[#d1dfda]" type="button">
          <Icon name="more" size={16} />
        </button>
      </div>
      <p className="mt-5 text-[12px] font-semibold text-[#7b8a86] dark:text-[#99aaa5]">{stat.label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-[26px] font-extrabold tracking-[-0.06em] text-[#1a2b27] dark:text-[#eff8f4]">{stat.value}</p>
        <span className={`mb-1 rounded-full px-2 py-1 text-[10px] font-bold ${styles.soft}`}>{stat.detail}</span>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        {eyebrow && <p className="muted-label mb-1.5">{eyebrow}</p>}
        <h2 className="text-[17px] font-extrabold tracking-[-0.035em] text-[#1c302b] dark:text-[#edf7f3]">{title}</h2>
      </div>
      {action && (
        <button className="flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-bold text-[#0d7f78] transition hover:bg-[#eaf6f2] dark:text-[#8ee0cf] dark:hover:bg-[#193b36]" onClick={onAction} type="button">
          {action}<Icon name="arrow-up-right" size={14} />
        </button>
      )}
    </div>
  );
}

function EventRow({ event, compact = false, onOpen }: { event: EventItem; compact?: boolean; onOpen: (event: EventItem) => void }) {
  const styles = toneStyles[event.tone];
  return (
    <div className={`group flex items-center gap-3 ${compact ? "py-3" : "py-3.5"}`}>
      <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[14px] ${styles.soft}`}>
        <span className="text-[9px] font-extrabold tracking-[0.08em]">{event.day}</span>
        <span className="text-base font-extrabold leading-4 tracking-[-0.05em]">{event.date}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-bold text-[#253731] dark:text-[#eaf5f0]">{event.title}</p>
          {!compact && <span className={`hidden rounded-full px-2 py-0.5 text-[9px] font-bold sm:inline-flex ${styles.soft}`}>{event.club}</span>}
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#84928e] dark:text-[#9aada7]">
          <Icon name="clock" size={12} /> {event.time}<span className="mx-0.5">·</span><Icon name="map-pin" size={12} /> {event.location}
        </p>
      </div>
      <button aria-label={`Open details for ${event.title}`} className="rounded-xl p-2 text-[#9aa8a3] opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100 hover:bg-[#edf5f1] hover:text-[#0d7f78] dark:hover:bg-[#24322f] dark:hover:text-[#a4e9d9]" onClick={() => onOpen(event)} type="button">
        <Icon name="chevron-right" size={16} />
      </button>
    </div>
  );
}

function ClubCard({ club, membershipStatus = "available", onOpen }: { club: ClubItem; membershipStatus?: ClubMembershipStatus; onOpen: (club: ClubItem) => void }) {
  const styles = toneStyles[club.tone];
  const statusLabel = membershipStatus === "member" ? "Member" : membershipStatus === "pending" ? "Request pending" : "";
  return (
    <div className="group flex items-center gap-3 rounded-2xl border bg-white/50 p-3 transition hover:-translate-y-0.5 hover:bg-white dark:bg-[#18221f]/60 dark:hover:bg-[#1b2925]">
      <Avatar initials={club.initials} tone={club.tone} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#243731] dark:text-[#e8f4ef]">{club.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[#83918d] dark:text-[#9baea8]">
          <span>{club.category}</span><span aria-hidden="true">·</span><span>{club.members}</span>
          {statusLabel && <span aria-label={`Membership status: ${statusLabel}`} className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${membershipStatus === "member" ? "bg-[#e6f6ef] text-[#0d7f78] dark:bg-[#19483e] dark:text-[#9de3d3]" : "bg-[#fff6df] text-[#9c6e0e] dark:bg-[#463816] dark:text-[#ffd978]"}`}>{statusLabel}</span>}
        </div>
      </div>
      <button aria-label={`Open details for ${club.name}${statusLabel ? `, ${statusLabel}` : ""}`} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${styles.soft} opacity-80 transition group-hover:opacity-100`} onClick={() => onOpen(club)} type="button">
        <Icon name="arrow-up-right" size={14} />
      </button>
    </div>
  );
}

function StudentOverview({ clubMembershipStatus, onOpenClub, onOpenEvent, onSectionAction }: { clubMembershipStatus: (club: ClubItem) => ClubMembershipStatus; onOpenClub: (club: ClubItem) => void; onOpenEvent: (event: EventItem) => void; onSectionAction: (action: string) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card p-5 sm:p-6">
        <SectionHeader eyebrow="Next up" onAction={() => onSectionAction("View calendar")} title="Your week" action="View calendar" />
        <div className="divide-y divide-[#e8eeea] dark:divide-[#263530]">
          {studentEvents.map((event) => <EventRow event={event} key={`${event.date}-${event.title}`} onOpen={onOpenEvent} />)}
        </div>
        <div className="mt-2 rounded-2xl bg-[#f7faf7] px-4 py-3 dark:bg-[#1a2522]">
          <p className="flex items-center gap-2 text-[11px] font-semibold text-[#74837e] dark:text-[#a5b7b1]"><span className="h-2 w-2 rounded-full bg-[#0d7f78]" /> You have 2 free evenings this week.</p>
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <SectionHeader eyebrow="Picked for you" onAction={() => onSectionAction("Explore all")} title="Discover next" action="Explore all" />
        <div className="space-y-2.5">
          {recommendedClubs.map((club) => <ClubCard club={club} key={club.name} membershipStatus={clubMembershipStatus(club)} onOpen={onOpenClub} />)}
        </div>
      </section>
    </div>
  );
}

function RequestRow({ onApprove, onOpen, request }: { onApprove: (request: RequestItem) => void; onOpen: (request: RequestItem) => void; request: RequestItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white/50 p-3 dark:bg-[#18221f]/60">
      <Avatar initials={request.initials} tone={request.tone} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#243731] dark:text-[#e8f4ef]">{request.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-[#83918d] dark:text-[#9baea8]">{request.club} <span className="mx-1">·</span> {request.time}</p>
      </div>
      <div className="flex gap-1.5">
        <button aria-label={`Approve request for ${request.name} to join ${request.club}`} className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e5f5ef] text-[#0d7f78] transition hover:bg-[#cbeee2] dark:bg-[#1b463e] dark:text-[#9ee4d4] dark:hover:bg-[#235b50]" onClick={() => onApprove(request)} type="button"><Icon name="check-circle" size={15} /></button>
        <button aria-label={`Review ${request.name}'s request to join ${request.club}`} className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f2f5f2] text-[#788984] transition hover:bg-[#e8eeea] dark:bg-[#26332f] dark:text-[#adbbb6] dark:hover:bg-[#31413b]" onClick={() => onOpen(request)} type="button"><Icon name="chevron-right" size={15} /></button>
      </div>
    </div>
  );
}

function LeaderOverview({ onApproveRequest, onOpenEvent, onOpenRequest, onSectionAction, requests }: { onApproveRequest: (request: RequestItem) => void; onOpenEvent: (event: EventItem) => void; onOpenRequest: (request: RequestItem) => void; onSectionAction: (action: string) => void; requests: RequestItem[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
      <section className="surface-card p-5 sm:p-6">
        <SectionHeader eyebrow="Needs your attention" onAction={() => onSectionAction("Review all")} title="Membership requests" action="Review all" />
        {requests.length > 0 ? (
          <div className="space-y-2.5">
            {requests.map((request) => <RequestRow key={requestKey(request)} onApprove={onApproveRequest} onOpen={onOpenRequest} request={request} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-[#f7faf7] px-4 py-6 text-center dark:bg-[#1a2522]">
            <p className="text-[12px] font-bold text-[#526a63] dark:text-[#b3c8c1]">No pending requests</p>
            <p className="mt-1 text-[11px] leading-4 text-[#7d8d88] dark:text-[#9db0a9]">New synthetic requests will appear here when the preview is reset.</p>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f7faf7] px-4 py-3 dark:bg-[#1a2522]">
          <span className="text-[11px] font-semibold text-[#74837e] dark:text-[#a5b7b1]">Average response time</span>
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#0d7f78] dark:text-[#92e2d1]"><Icon name="trend" size={13} /> 2.4 hrs</span>
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <SectionHeader eyebrow="On the horizon" onAction={() => onSectionAction("Manage events")} title="Upcoming events" action="Manage events" />
        <div className="divide-y divide-[#e8eeea] dark:divide-[#263530]">
          {leaderEvents.map((event) => <EventRow compact event={event} key={`${event.date}-${event.title}`} onOpen={onOpenEvent} />)}
        </div>
        <button aria-label="Add a synthetic event" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-[#fbfdfb] py-3 text-[11px] font-bold text-[#0d7f78] transition hover:border-[#89cbbd] hover:bg-[#f0faf6] dark:bg-[#17211f] dark:text-[#9ee4d4] dark:hover:border-[#386d63] dark:hover:bg-[#1c322d]" onClick={() => onSectionAction("Add an event")} type="button">
          <Icon name="plus" size={14} /> Add an event
        </button>
      </section>
    </div>
  );
}

function ImportRow({ item, onOpen }: { item: ImportItem; onOpen: (item: ImportItem) => void }) {
  const styles = toneStyles[item.tone];
  const statusStyles = {
    "Ready to review": "bg-[#fff5dc] text-[#9a6e12] dark:bg-[#473916] dark:text-[#ffda76]",
    Imported: "bg-[#e6f6ef] text-[#0d7f78] dark:bg-[#19483e] dark:text-[#9de3d3]",
    "Needs attention": "bg-[#fff0e9] text-[#bd5b35] dark:bg-[#4a2920] dark:text-[#ffb08d]",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white/50 p-3 dark:bg-[#18221f]/60">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${styles.icon}`}><Icon name="file" size={17} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#243731] dark:text-[#e8f4ef]">{item.name}</p>
        <p className="mt-0.5 text-[11px] text-[#83918d] dark:text-[#9baea8]">{item.type} <span className="mx-1">·</span> {item.rows}</p>
      </div>
      <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-flex ${statusStyles[item.status]}`}>{item.status}</span>
      <button aria-label={`Review ${item.name}`} className="rounded-xl p-2 text-[#97a59f] hover:bg-[#edf5f1] hover:text-[#0d7f78] dark:hover:bg-[#26352f] dark:hover:text-[#a4e9d9]" onClick={() => onOpen(item)} type="button"><Icon name="chevron-right" size={16} /></button>
    </div>
  );
}

function AdminOverview({ onOpenImport, onSectionAction }: { onOpenImport: (item: ImportItem) => void; onSectionAction: (action: string) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
      <section className="surface-card p-5 sm:p-6">
        <SectionHeader eyebrow="Data operations" onAction={() => onSectionAction("Open imports")} title="Import queue" action="Open imports" />
        <div className="space-y-2.5">
          {adminImports.map((item) => <ImportRow item={item} key={item.name} onOpen={onOpenImport} />)}
        </div>
        <button aria-label="Start a synthetic import preview" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-[#fbfdfb] py-3 text-[11px] font-bold text-[#0d7f78] transition hover:border-[#89cbbd] hover:bg-[#f0faf6] dark:bg-[#17211f] dark:text-[#9ee4d4] dark:hover:border-[#386d63] dark:hover:bg-[#1c322d]" onClick={() => onSectionAction("Start an import")} type="button">
          <Icon name="upload" size={14} /> Start an import
        </button>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <SectionHeader eyebrow="Latest activity" onAction={() => onSectionAction("View audit")} title="College pulse" action="View audit" />
        <div className="relative space-y-1 pl-2">
          <div className="absolute bottom-5 left-[19px] top-4 w-px bg-[#dce9e4] dark:bg-[#30443e]" />
          {adminActivity.map((activity) => {
            const styles = toneStyles[activity.tone];
            return (
              <div className="relative flex gap-3 py-3" key={activity.title}>
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}><Icon name={activity.icon} size={15} /></span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{activity.title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-[#82918c] dark:text-[#9baea8]">{activity.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f7faf7] p-3 dark:bg-[#1a2522]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#0d7f78] dark:bg-[#1a463d] dark:text-[#9ee4d4]"><Icon name="shield" size={15} /></span>
          <p className="text-[11px] leading-4 text-[#74837e] dark:text-[#a5b7b1]">Demo records are scoped to Northbridge College.</p>
        </div>
      </section>
    </div>
  );
}

function FocusedPanel({
  children,
  description,
  eyebrow,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  icon: IconName;
  title: string;
}) {
  return (
    <section className="surface-card p-5 sm:p-7" aria-labelledby="focused-panel-title">
      <div className="flex flex-col gap-5 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#e9f8f3] text-[#0d7f78] dark:bg-[#123b36] dark:text-[#a5e9d9]">
            <Icon name={icon} size={19} />
          </span>
          <div>
            <p className="muted-label">{eyebrow}</p>
            <h2 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.05em] text-[#1c302b] dark:text-[#edf7f3]" id="focused-panel-title">{title}</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#71827d] dark:text-[#a5b7b1]">{description}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f3f8f5] px-2.5 py-1.5 text-[10px] font-bold text-[#71827d] dark:bg-[#1a2522] dark:text-[#a5b7b1]"><span className="h-1.5 w-1.5 rounded-full bg-[#2caa89]" /> Preview view</span>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function AttendancePreview({ roleKey }: { roleKey: RoleKey }) {
  const metrics = roleKey === "student"
    ? [
        { label: "Events attended", value: "18", detail: "This term", tone: "teal" as Tone },
        { label: "Class attendance", value: "86%", detail: "Across 4 courses", tone: "violet" as Tone },
        { label: "Current streak", value: "6", detail: "Sessions in a row", tone: "amber" as Tone },
      ]
    : [
        { label: "Events captured", value: "28", detail: "Across your clubs", tone: "teal" as Tone },
        { label: "Attendance rate", value: "92%", detail: "+4% this month", tone: "violet" as Tone },
        { label: "Needs review", value: "03", detail: "Synthetic records", tone: "coral" as Tone },
      ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => {
        const styles = toneStyles[metric.tone];
        return (
          <div className="rounded-2xl border bg-white/50 p-4 dark:bg-[#18221f]/60" key={metric.label}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.icon}`}><Icon name="check-circle" size={16} /></span>
            <p className="mt-5 text-[11px] font-semibold text-[#7b8a86] dark:text-[#99aaa5]">{metric.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-[-0.06em] text-[#1a2b27] dark:text-[#eff8f4]">{metric.value}</p>
            <p className="mt-1 text-[11px] text-[#83918d] dark:text-[#9baea8]">{metric.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

function FocusedWorkspace({
  activeNav,
  onApproveRequest,
  clubMembershipStatus,
  onOpenClub,
  onOpenEvent,
  onOpenImport,
  onOpenRequest,
  onSectionAction,
  pendingRequests,
  roleKey,
}: {
  activeNav: string;
  onApproveRequest: (request: RequestItem) => void;
  clubMembershipStatus: (club: ClubItem) => ClubMembershipStatus;
  onOpenClub: (club: ClubItem) => void;
  onOpenEvent: (event: EventItem) => void;
  onOpenImport: (item: ImportItem) => void;
  onOpenRequest: (request: RequestItem) => void;
  onSectionAction: (action: string) => void;
  pendingRequests: RequestItem[];
  roleKey: RoleKey;
}) {
  if (activeNav === "Attendance") {
    return (
      <FocusedPanel description="A quick read on participation, kept separate from the real authenticated attendance workspace." eyebrow="Synthetic attendance" icon="check-circle" title="Attendance at a glance">
        <AttendancePreview roleKey={roleKey} />
      </FocusedPanel>
    );
  }

  if (roleKey === "student" && (activeNav === "Discover" || activeNav === "My clubs")) {
    return (
      <FocusedPanel description="Browse a few synthetic communities and open one to see the kind of detail a connected campus directory will provide." eyebrow={activeNav === "Discover" ? "Find your next circle" : "Your campus circle"} icon="users" title={activeNav}>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendedClubs.map((club) => <ClubCard club={club} key={club.name} membershipStatus={clubMembershipStatus(club)} onOpen={onOpenClub} />)}
        </div>
      </FocusedPanel>
    );
  }

  if (roleKey === "student" && activeNav === "Events") {
    return (
      <FocusedPanel description="Open an event for location, timing, and a synthetic preview of the event detail flow." eyebrow="Coming up" icon="calendar" title="Your events">
        <div className="divide-y divide-[#e8eeea] dark:divide-[#263530]">
          {studentEvents.map((event) => <EventRow event={event} key={`${event.date}-${event.title}`} onOpen={onOpenEvent} />)}
        </div>
      </FocusedPanel>
    );
  }

  if (roleKey === "student" && activeNav === "Profile") {
    const profile = roleProfiles.student;
    return (
      <FocusedPanel description="Your profile controls will eventually connect to Supabase Auth and college-managed profile fields." eyebrow="Synthetic identity" icon="user" title="Profile preview">
        <div className="flex flex-col gap-4 rounded-2xl border bg-white/50 p-4 sm:flex-row sm:items-center dark:bg-[#18221f]/60">
          <Avatar initials={profile.initials} size="lg" tone="teal" />
          <div>
            <p className="text-lg font-extrabold tracking-[-0.04em] text-[#243731] dark:text-[#e8f4ef]">{profile.name}</p>
            <p className="mt-1 text-sm text-[#71827d] dark:text-[#a5b7b1]">{profile.college} · Student preview</p>
          </div>
        </div>
      </FocusedPanel>
    );
  }

  if (roleKey === "leader" && activeNav === "Requests") {
    return (
      <FocusedPanel description="Review synthetic applicants without sending an invitation or changing a real membership record." eyebrow="Needs your attention" icon="inbox" title="Membership requests">
        {pendingRequests.length > 0 ? (
          <div className="space-y-2.5">
            {pendingRequests.map((request) => <RequestRow key={requestKey(request)} onApprove={onApproveRequest} onOpen={onOpenRequest} request={request} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-[#f7faf7] px-4 py-8 text-center dark:bg-[#1a2522]">
            <p className="text-[12px] font-bold text-[#526a63] dark:text-[#b3c8c1]">All requests are reviewed</p>
            <p className="mt-1 text-[11px] leading-4 text-[#7d8d88] dark:text-[#9db0a9]">The local queue is empty. Refresh the preview to restore synthetic requests.</p>
          </div>
        )}
      </FocusedPanel>
    );
  }

  if (roleKey === "leader" && activeNav === "Events") {
    return (
      <FocusedPanel description="Keep the next club moments visible and open an event to inspect its synthetic detail state." eyebrow="On the horizon" icon="calendar" title="Manage events">
        <div className="divide-y divide-[#e8eeea] dark:divide-[#263530]">
          {leaderEvents.map((event) => <EventRow compact event={event} key={`${event.date}-${event.title}`} onOpen={onOpenEvent} />)}
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-[#fbfdfb] py-3 text-[11px] font-bold text-[#0d7f78] transition hover:border-[#89cbbd] hover:bg-[#f0faf6] dark:bg-[#17211f] dark:text-[#9ee4d4] dark:hover:border-[#386d63] dark:hover:bg-[#1c322d]" onClick={() => onSectionAction("Add an event")} type="button"><Icon name="plus" size={14} /> Add a synthetic event</button>
      </FocusedPanel>
    );
  }

  if (roleKey === "admin" && activeNav === "Imports") {
    return (
      <FocusedPanel description="Open a file to see the validation and preview interaction. This public demo never uploads or writes data." eyebrow="Data operations" icon="upload" title="Import queue">
        <div className="space-y-2.5">
          {adminImports.map((item) => <ImportRow item={item} key={item.name} onOpen={onOpenImport} />)}
        </div>
      </FocusedPanel>
    );
  }

  if (roleKey === "admin" && activeNav === "Audit") {
    return (
      <FocusedPanel description="A synthetic activity trail helps demonstrate how a future college audit view can stay readable and contextual." eyebrow="Latest activity" icon="clipboard" title="College pulse">
        <div className="space-y-2.5">
          {adminActivity.map((activity) => {
            const styles = toneStyles[activity.tone];
            return <div className="flex items-center gap-3 rounded-2xl border bg-white/50 p-3 dark:bg-[#18221f]/60" key={activity.title}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}><Icon name={activity.icon} size={15} /></span><div><p className="text-[12px] font-bold text-[#2a3b36] dark:text-[#e6f2ed]">{activity.title}</p><p className="mt-1 text-[11px] text-[#82918c] dark:text-[#9baea8]">{activity.detail}</p></div></div>;
          })}
        </div>
      </FocusedPanel>
    );
  }

  const profile = roleProfiles[roleKey];
  const context = activeNav === "Settings"
    ? "Preview preferences, notification rules, and access settings before they are connected to a real account."
    : `A focused ${activeNav.toLowerCase()} workspace for the ${profile.label.toLowerCase()} preview.`;
  return (
    <FocusedPanel description={context} eyebrow={profile.eyebrow} icon={profile.nav.find((item) => item.label === activeNav)?.icon ?? "layout"} title={activeNav}>
      <div className="rounded-2xl border border-dashed bg-[#f7faf7] p-6 dark:bg-[#1a2522]">
        <p className="text-[13px] font-bold text-[#526a63] dark:text-[#b3c8c1]">This preview is ready for the next workflow</p>
        <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#7d8d88] dark:text-[#9db0a9]">Use the primary actions, search, notifications, or role picker to explore the interaction model. No real records are created from this page.</p>
      </div>
    </FocusedPanel>
  );
}

function Dashboard({
  activeNav,
  onApproveRequest,
  clubMembershipStatus,
  onOpenClub,
  onOpenEvent,
  onOpenImport,
  onOpenRequest,
  onPrimaryAction,
  onRoleChange,
  onSecondaryAction,
  onSectionAction,
  pendingRequests,
  roleKey,
}: {
  activeNav: string;
  onApproveRequest: (request: RequestItem) => void;
  clubMembershipStatus: (club: ClubItem) => ClubMembershipStatus;
  onOpenClub: (club: ClubItem) => void;
  onOpenEvent: (event: EventItem) => void;
  onOpenImport: (item: ImportItem) => void;
  onOpenRequest: (request: RequestItem) => void;
  onPrimaryAction: () => void;
  onRoleChange: (roleKey: RoleKey) => void;
  onSecondaryAction: () => void;
  onSectionAction: (action: string) => void;
  pendingRequests: RequestItem[];
  roleKey: RoleKey;
}) {
  const profile = roleProfiles[roleKey];
  const isOverview = activeNav === "Home" || activeNav === "Overview";
  const title = isOverview ? profile.greeting : activeNav;
  const description = isOverview ? profile.description : `A focused ${activeNav.toLowerCase()} view for the ${profile.label.toLowerCase()} demo workspace.`;
  const stats = profile.stats.map((stat) => roleKey === "leader" && stat.label === "Pending requests"
    ? { ...stat, value: String(pendingRequests.length).padStart(2, "0"), detail: pendingRequests.length === 0 ? "All reviewed" : "Needs a review" }
    : stat);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-5 sm:px-6 sm:pt-7 xl:px-9" id="main-content">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#dff3ec] px-5 py-6 dark:bg-[#153a35] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="dot-grid pointer-events-none absolute -right-8 -top-20 h-72 w-72 rounded-full opacity-80 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 right-[18%] h-48 w-48 rounded-full bg-[#f5a56d]/25 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[650px]">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#27766d] dark:bg-[#0e2925]/60 dark:text-[#a1e6d7]">{profile.eyebrow}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-[#c2eadf]/70 px-2.5 py-1 text-[10px] font-bold text-[#4c7770] dark:bg-[#1d5149] dark:text-[#adddd2]"><span className="h-1.5 w-1.5 rounded-full bg-[#2caa89]" /> Demo data</span>
            </div>
            <h1 className="max-w-[560px] text-[32px] font-extrabold leading-[1.06] tracking-[-0.065em] text-[#143d37] dark:text-[#e9faf4] sm:text-[42px]">{title}</h1>
            <p className="mt-3 max-w-[530px] text-[13px] leading-6 text-[#4f7770] dark:text-[#b3d9d0] sm:text-[14px]">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button className="flex items-center gap-2 rounded-xl bg-[#0d7f78] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_10px_20px_-12px_rgba(13,127,120,0.9)] transition hover:-translate-y-0.5 hover:bg-[#096c66]" onClick={onPrimaryAction} type="button">
                <Icon name={roleKey === "admin" ? "upload" : roleKey === "leader" ? "plus" : "compass"} size={15} /> {profile.primaryAction}
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-[12px] font-bold text-[#2e6760] transition hover:-translate-y-0.5 hover:bg-white dark:bg-[#0e2925]/60 dark:text-[#c1e7dd] dark:hover:bg-[#12332f]" onClick={onSecondaryAction} type="button">
                {profile.secondaryAction} <Icon name="arrow-up-right" size={14} />
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-[350px] rounded-[22px] border border-white/70 bg-white/55 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-[#0d2925]/55">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#608a82] dark:text-[#a3d5cb]">Preview a role</p>
            <div className="grid grid-cols-3 gap-1 rounded-[15px] bg-[#c7e9df]/65 p-1 dark:bg-[#0b2723]/80">
              {roleOrder.map((key) => {
                const role = roleProfiles[key];
                const selected = key === roleKey;
                return (
                  <button className={`rounded-xl px-2 py-2 text-[11px] font-bold transition ${selected ? "bg-white text-[#1b665e] shadow-sm dark:bg-[#214941] dark:text-[#d2f6ed]" : "text-[#5f8981] hover:bg-white/60 dark:text-[#9bc8bd] dark:hover:bg-white/5"}`} key={key} onClick={() => onRoleChange(key)} type="button">
                    {role.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
      </div>

      <div className="mt-5">
        {isOverview ? (
          <>
            {roleKey === "student" && <StudentOverview clubMembershipStatus={clubMembershipStatus} onOpenClub={onOpenClub} onOpenEvent={onOpenEvent} onSectionAction={onSectionAction} />}
            {roleKey === "leader" && <LeaderOverview onApproveRequest={onApproveRequest} onOpenEvent={onOpenEvent} onOpenRequest={onOpenRequest} onSectionAction={onSectionAction} requests={pendingRequests} />}
            {roleKey === "admin" && <AdminOverview onOpenImport={onOpenImport} onSectionAction={onSectionAction} />}
          </>
        ) : (
          <FocusedWorkspace activeNav={activeNav} clubMembershipStatus={clubMembershipStatus} onApproveRequest={onApproveRequest} onOpenClub={onOpenClub} onOpenEvent={onOpenEvent} onOpenImport={onOpenImport} onOpenRequest={onOpenRequest} onSectionAction={onSectionAction} pendingRequests={pendingRequests} roleKey={roleKey} />
        )}
      </div>

      <p className="mt-7 flex items-center justify-center gap-2 text-center text-[10px] font-semibold text-[#8b9995] dark:text-[#819993]"><Icon name="shield" size={13} /> Synthetic data only · This preview does not connect to authentication or a live database.</p>
    </main>
  );
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<RoleKey>("student");
  const [activeNav, setActiveNav] = useState("Home");
  const [theme, setTheme] = useState<Theme>("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [importPanel, setImportPanel] = useState<ImportPanelState | null>(null);
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>(() => leaderRequests);
  const [approvedClubNames, setApprovedClubNames] = useState<string[]>([]);

  const profile = useMemo(() => {
    const baseProfile = roleProfiles[activeRole];
    if (activeRole !== "leader") return baseProfile;
    return {
      ...baseProfile,
      nav: baseProfile.nav.map((item) => item.label === "Requests" ? { ...item, count: String(pendingRequests.length) } : item),
    };
  }, [activeRole, pendingRequests.length]);

  function getClubMembershipStatus(club: ClubItem): ClubMembershipStatus {
    if (approvedClubNames.includes(club.name)) return "member";
    if (pendingRequests.some((request) => request.name === roleProfiles.student.name && request.club === club.name)) return "pending";
    return "available";
  }

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("campussphere-theme") as Theme | null;
    const preferredTheme = savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferredTheme);
    document.documentElement.classList.toggle("dark", preferredTheme === "dark");
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (detailTarget) {
        setDetailTarget(null);
      } else if (importPanel) {
        setImportPanel(null);
      } else if (notificationsOpen) {
        setNotificationsOpen(false);
      } else if (searchOpen) {
        setSearchOpen(false);
      } else if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [detailTarget, importPanel, mobileMenuOpen, notificationsOpen, searchOpen]);

  const roleHint = useMemo(() => {
    if (activeRole === "student") return "Switch to a leader or admin preview from the role picker.";
    if (activeRole === "leader") return "Switch roles to preview the student or college admin workspace.";
    return "Switch roles to preview the student or club leader workspace.";
  }, [activeRole]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("campussphere-theme", nextTheme);
  }

  function closePopovers() {
    setSearchOpen(false);
    setNotificationsOpen(false);
  }

  function openEvent(event: EventItem) {
    closePopovers();
    setSearchQuery("");
    setImportPanel(null);
    setDetailTarget({ kind: "event", item: event });
  }

  function openClub(club: ClubItem) {
    closePopovers();
    setSearchQuery("");
    setImportPanel(null);
    setDetailTarget({ kind: "club", item: club });
  }

  function openRequest(request: RequestItem) {
    closePopovers();
    setSearchQuery("");
    setImportPanel(null);
    setDetailTarget({ kind: "request", item: request });
  }

  function openFeedback(title: string, message: string, context?: string) {
    closePopovers();
    setSearchQuery("");
    setImportPanel(null);
    setDetailTarget({ kind: "feedback", title, message, context });
  }

  function openImport(item: ImportItem, phase: ImportPanelState["phase"] = "review") {
    closePopovers();
    setSearchQuery("");
    setDetailTarget(null);
    setImportPanel({ item, phase });
  }

  function requestMembership(club: ClubItem) {
    const studentProfile = roleProfiles.student;
    const membershipStatus = getClubMembershipStatus(club);
    if (membershipStatus === "member") {
      setNotice(`${club.name} is already marked Member for ${studentProfile.name} in this synthetic preview.`);
      return;
    }
    if (membershipStatus === "pending") {
      setNotice(`${studentProfile.name}'s request to join ${club.name} is already pending locally.`);
      return;
    }

    const request: RequestItem = {
      name: studentProfile.name,
      club: club.name,
      time: "Just now",
      context: `${studentProfile.name} requested to join from the Student preview. This local demo request stays in React state and is not written to Supabase.`,
      initials: studentProfile.initials,
      tone: club.tone,
    };
    setPendingRequests((currentRequests) => currentRequests.some((item) => requestKey(item) === requestKey(request)) ? currentRequests : [...currentRequests, request]);
    setHasUnreadNotifications(true);
    setNotice(`Request to join ${club.name} sent for ${studentProfile.name}. This is a local synthetic request; nothing was written to Supabase.`);
  }

  function approveRequest(request: RequestItem) {
    setPendingRequests((currentRequests) => currentRequests.filter((item) => requestKey(item) !== requestKey(request)));
    if (request.name === roleProfiles.student.name) {
      setApprovedClubNames((currentNames) => currentNames.includes(request.club) ? currentNames : [...currentNames, request.club]);
    }
    setDetailTarget(null);
    setNotice(`${request.name}'s request to join ${request.club} was approved in this synthetic preview. The membership is stored locally for this session only.`);
  }

  function handlePrimaryAction() {
    if (activeRole === "student") {
      setActiveNav("Discover");
      openClub(recommendedClubs[0]);
      return;
    }
    if (activeRole === "leader") {
      setActiveNav("Events");
      openFeedback("Create an event", "The synthetic event editor is ready for a future connected flow.", "For this preview, review an upcoming event or use the Events navigation to continue exploring without creating a real record.");
      return;
    }
    setActiveNav("Imports");
    openImport(adminImports[0]);
  }

  function handleSecondaryAction() {
    if (activeRole === "student") {
      setActiveNav("Events");
      openEvent(studentEvents[0]);
      return;
    }
    if (activeRole === "leader") {
      setActiveNav("Requests");
      if (pendingRequests[0]) {
        openRequest(pendingRequests[0]);
      } else {
        openFeedback("Requests reviewed", "There are no pending membership requests in this local preview.", "The request count and empty state update locally when approvals are made.");
      }
      return;
    }
    setActiveNav("Audit");
    openFeedback("Reports preview", "Reports are represented by the synthetic activity trail.", "Use View audit from the College pulse section to keep exploring the sample audit context.");
  }

  function handleSectionAction(action: string) {
    if (action === "View calendar") {
      setActiveNav("Events");
      openEvent(studentEvents[0]);
    } else if (action === "Explore all") {
      setActiveNav("Discover");
      openClub(recommendedClubs[0]);
    } else if (action === "Review all") {
      setActiveNav("Requests");
      if (pendingRequests[0]) {
        openRequest(pendingRequests[0]);
      } else {
        openFeedback("No pending requests", "Every synthetic membership request has been reviewed.", "The local request queue is empty. Switch roles or refresh the preview to start over.");
      }
    } else if (action === "Manage events") {
      setActiveNav("Events");
      openEvent(leaderEvents[0]);
    } else if (action === "Add an event") {
      setActiveNav("Events");
      openFeedback("Add an event", "The event form is represented as a local preview action.", "No event is created here. Review the upcoming event details while connected event services are still to come.");
    } else if (action === "Open imports" || action === "Start an import") {
      setActiveNav("Imports");
      openImport(adminImports[0]);
    } else if (action === "View audit") {
      setActiveNav("Audit");
      openFeedback("Audit preview", "The activity trail shows synthetic changes scoped to Northbridge College.", "This preview does not read or write an audit service.");
    }
  }

  function handleRoleSelect(role: RoleKey) {
    setActiveRole(role);
    setActiveNav(role === "student" ? "Home" : "Overview");
    setSearchQuery("");
    closePopovers();
    setDetailTarget(null);
    setImportPanel(null);
    setNotice("");
  }

  function handleNavSelect(label: string) {
    setActiveNav(label);
    setSearchQuery("");
    closePopovers();
    setNotice(`${label} is selected in the ${profile.label.toLowerCase()} preview.`);
  }

  const visibleNotifications = useMemo<NotificationItem[]>(() => {
    if (activeRole !== "leader") return notifications;
    const localRequestNotifications = pendingRequests
      .filter((request) => request.name === roleProfiles.student.name)
      .map((request): NotificationItem => ({
        id: `membership-request-${requestKey(request)}`,
        title: `${request.name} requested to join ${request.club}`,
        detail: "Student preview · local synthetic request",
        time: request.time,
        target: "request",
        targetKey: requestKey(request),
        tone: request.tone,
      }));
    return [...localRequestNotifications, ...notifications];
  }, [activeRole, pendingRequests]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const matches = (value: string) => value.toLowerCase().includes(query);
    const results: SearchResult[] = [];

    profile.nav.forEach((item) => {
      if (matches(item.label)) results.push({ kind: "nav", label: item.label, icon: item.icon, detail: `${profile.label} navigation` });
    });

    if (activeRole === "student") {
      studentEvents.forEach((event) => {
        if (matches(`${event.title} ${event.club} ${event.location} ${event.description}`)) results.push({ kind: "event", item: event });
      });
      recommendedClubs.forEach((club) => {
        if (matches(`${club.name} ${club.category} ${club.description}`)) results.push({ kind: "club", item: club });
      });
    } else if (activeRole === "leader") {
      leaderEvents.forEach((event) => {
        if (matches(`${event.title} ${event.club} ${event.location} ${event.description}`)) results.push({ kind: "event", item: event });
      });
      pendingRequests.forEach((request) => {
        if (matches(`${request.name} ${request.club} ${request.context}`)) results.push({ kind: "request", item: request });
      });
    } else {
      adminImports.forEach((item) => {
        if (matches(`${item.name} ${item.type} ${item.status} ${item.validationMessage}`)) results.push({ kind: "import", item });
      });
    }

    return results.slice(0, 8);
  }, [activeRole, pendingRequests, profile, searchQuery]);

  function handleSearchResult(result: SearchResult) {
    if (result.kind === "nav") {
      handleNavSelect(result.label);
    } else if (result.kind === "event") {
      openEvent(result.item);
    } else if (result.kind === "club") {
      openClub(result.item);
    } else if (result.kind === "request") {
      openRequest(result.item);
    } else {
      openImport(result.item);
    }
  }

  function handleNotification(notification: NotificationItem) {
    if (notification.target === "event") {
      const event = [...studentEvents, ...leaderEvents].find((item) => item.title === notification.targetKey);
      if (event) {
        openEvent(event);
      } else {
        openFeedback("Event notification", "This synthetic event is no longer in the visible preview.");
      }
    } else if (notification.target === "request") {
      const request = pendingRequests.find((item) => requestKey(item) === notification.targetKey || item.name === notification.targetKey);
      if (request) {
        openRequest(request);
      } else {
        openFeedback("Request already reviewed", "That synthetic membership request is no longer pending.", "Approvals stay local to this demo and do not contact the applicant.");
      }
    } else if (notification.target === "import") {
      const item = adminImports.find((candidate) => candidate.name === notification.targetKey);
      if (item) {
        openImport(item);
      } else {
        openFeedback("Import notification", "This synthetic import is not available in the current preview.");
      }
    } else {
      openFeedback("CampusSphere preview", "The public synthetic workspace is ready to explore.", "Use the role picker, navigation, search, and notification examples to try the interaction pass.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f5f1] dark:bg-[#0d1212]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar activeNav={activeNav} onSelect={handleNavSelect} profile={profile} />
        </div>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b bg-[#f3f5f1]/90 px-4 backdrop-blur-xl dark:bg-[#0d1212]/90 sm:px-6 xl:px-9">
            <div className="flex items-center gap-3">
              <button aria-expanded={mobileMenuOpen} aria-label="Open navigation" className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white/75 text-[#5d716b] dark:bg-[#17211f]/80 dark:text-[#a5bbb4] lg:hidden" onClick={() => setMobileMenuOpen(true)} type="button">
                <Icon name="menu" size={19} />
              </button>
              <div className="lg:hidden"><Logo compact /></div>
              <div className="hidden items-center gap-2 text-xs font-semibold text-[#879590] dark:text-[#8da29c] sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0d7f78]" />
                {profile.college}
                <span className="text-[#c0cbc7] dark:text-[#4f655e]">/</span>
                <span className="text-[#536762] dark:text-[#c0d0ca]">{activeNav}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative z-50 hidden md:block">
                <label className="flex h-10 w-[210px] items-center gap-2 rounded-xl border bg-white/65 px-3 text-[#8b9b96] transition focus-within:border-[#86c8bb] focus-within:ring-2 focus-within:ring-[#bfe6dc] dark:bg-[#17211f]/75 dark:focus-within:border-[#39766b] dark:focus-within:ring-[#1a4039]">
                  <Icon name="search" size={16} />
                  <span className="sr-only">Search the campus preview</span>
                  <input aria-controls="search-results" aria-expanded={searchOpen && Boolean(searchQuery.trim())} autoComplete="off" className="w-full bg-transparent text-xs font-medium text-[#31423c] outline-none placeholder:text-[#9aa8a3] dark:text-[#e3efeb] dark:placeholder:text-[#71857f]" name="campus-search" onChange={(event) => { setSearchQuery(event.target.value); setSearchOpen(Boolean(event.target.value.trim())); setNotificationsOpen(false); }} onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }} placeholder="Search campus…" type="search" value={searchQuery} />
                  <kbd className="rounded-md border bg-[#f6f9f6] px-1.5 py-0.5 text-[9px] font-bold text-[#9aa8a3] dark:bg-[#25322f] dark:text-[#94a9a3]">⌘ K</kbd>
                </label>
                 {searchOpen && searchQuery.trim() && <SearchPopover clubMembershipStatus={getClubMembershipStatus} onSelect={handleSearchResult} query={searchQuery} results={searchResults} />}
              </div>
              <div className="relative z-50">
                <button aria-controls="notification-popover" aria-expanded={notificationsOpen} aria-label="View notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white/75 text-[#62736e] transition hover:-translate-y-0.5 hover:border-[#b9d8cf] hover:text-[#0d7f78] dark:bg-[#17211f]/80 dark:text-[#a7bbb5] dark:hover:border-[#386d63] dark:hover:text-[#a3e8d7]" onClick={() => { setNotificationsOpen((isOpen) => !isOpen); setSearchOpen(false); setHasUnreadNotifications(false); }} type="button">
                  <Icon name="bell" size={17} />
                  {hasUnreadNotifications && <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-[#eb8d61] ring-2 ring-[#f3f5f1] dark:ring-[#0d1212]" />}
                </button>
                 {notificationsOpen && <NotificationPopover notificationItems={visibleNotifications} onSelect={handleNotification} />}
              </div>
              <ThemeToggle onToggle={toggleTheme} theme={theme} />
              <div className="hidden items-center gap-2 sm:flex"><Avatar initials={profile.initials} tone={activeRole === "admin" ? "violet" : "teal"} size="sm" /><span className="hidden max-w-[100px] truncate text-xs font-bold text-[#31423c] dark:text-[#dcebe5] xl:block">{profile.name}</span></div>
            </div>
          </header>

           <Dashboard activeNav={activeNav} clubMembershipStatus={getClubMembershipStatus} onApproveRequest={approveRequest} onOpenClub={openClub} onOpenEvent={openEvent} onOpenImport={openImport} onOpenRequest={openRequest} onPrimaryAction={handlePrimaryAction} onRoleChange={handleRoleSelect} onSecondaryAction={handleSecondaryAction} onSectionAction={handleSectionAction} pendingRequests={pendingRequests} roleKey={activeRole} />
        </div>
      </div>

      {(notificationsOpen || (searchOpen && Boolean(searchQuery.trim()))) && <button aria-label="Close open popover" className="fixed inset-0 z-20 cursor-default bg-transparent" onClick={closePopovers} type="button" />}
      {mobileMenuOpen && <MobileNav activeNav={activeNav} onClose={() => setMobileMenuOpen(false)} onSelect={handleNavSelect} profile={profile} />}
       {detailTarget && <DetailOverlay membershipStatus={detailTarget.kind === "club" ? getClubMembershipStatus(detailTarget.item) : "available"} onApprove={approveRequest} onClose={() => setDetailTarget(null)} onRequestJoin={requestMembership} target={detailTarget} />}
      {importPanel && <ImportReviewPanel onClose={() => setImportPanel(null)} onPreviewReady={() => { setImportPanel((current) => current ? { ...current, phase: "preview-ready" } : current); setNotice("Import preview ready. No upload or database write occurred."); }} panel={importPanel} />}

      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 rounded-2xl border bg-[#173d38] px-4 py-3 text-center text-xs font-semibold text-[#e6faf4] shadow-2xl transition ${notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        <div className="flex items-center justify-center gap-2"><Icon name="sparkles" size={15} /> <span>{notice || " "}</span></div>
      </div>

      <div className="sr-only" aria-live="polite">{roleHint}</div>
    </div>
  );
}

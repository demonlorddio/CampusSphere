export type RoleKey = "student" | "leader" | "admin";

export type IconName =
  | "activity"
  | "arrow-up-right"
  | "award"
  | "bell"
  | "bookmark"
  | "building"
  | "calendar"
  | "check-circle"
  | "chevron-right"
  | "clipboard"
  | "clock"
  | "compass"
  | "download"
  | "file"
  | "home"
  | "inbox"
  | "layout"
  | "map-pin"
  | "menu"
  | "moon"
  | "more"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "sun"
  | "trend"
  | "upload"
  | "user"
  | "users";

export type Tone = "teal" | "coral" | "violet" | "amber";

export type NavItem = {
  label: string;
  icon: IconName;
  count?: string;
};

export type StatItem = {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: Tone;
};

export type RoleProfile = {
  label: string;
  shortLabel: string;
  eyebrow: string;
  name: string;
  initials: string;
  college: string;
  greeting: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  nav: NavItem[];
  stats: StatItem[];
};

export type EventItem = {
  day: string;
  date: string;
  title: string;
  club: string;
  time: string;
  location: string;
  description: string;
  tone: Tone;
};

export type ClubItem = {
  name: string;
  category: string;
  members: string;
  description: string;
  initials: string;
  tone: Tone;
};

export type RequestItem = {
  name: string;
  club: string;
  time: string;
  context: string;
  initials: string;
  tone: Tone;
};

export type ImportItem = {
  name: string;
  type: string;
  status: "Ready to review" | "Imported" | "Needs attention";
  rows: string;
  fileSize: string;
  validationMessage: string;
  tone: Tone;
};

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  target: "event" | "request" | "import" | "feedback";
  targetKey: string;
  tone: Tone;
};

export const roleOrder: RoleKey[] = ["student", "leader", "admin"];

export const roleProfiles: Record<RoleKey, RoleProfile> = {
  student: {
    label: "Student",
    shortLabel: "Student",
    eyebrow: "Student workspace",
    name: "Maya Chen",
    initials: "MC",
    college: "Northbridge College",
    greeting: "Good morning, Maya",
    description: "Stay close to the clubs, events, and opportunities shaping your campus life.",
    primaryAction: "Discover clubs",
    secondaryAction: "View my calendar",
    nav: [
      { label: "Home", icon: "home" },
      { label: "Discover", icon: "compass" },
      { label: "My clubs", icon: "users", count: "4" },
      { label: "Events", icon: "calendar" },
      { label: "Attendance", icon: "check-circle" },
      { label: "Profile", icon: "user" },
    ],
    stats: [
      { label: "Active clubs", value: "04", detail: "+1 this term", icon: "users", tone: "teal" },
      { label: "Upcoming events", value: "07", detail: "Across 3 clubs", icon: "calendar", tone: "coral" },
      { label: "Attendance streak", value: "86%", detail: "+12% this month", icon: "check-circle", tone: "violet" },
      { label: "Saved opportunities", value: "12", detail: "3 closing soon", icon: "bookmark", tone: "amber" },
    ],
  },
  leader: {
    label: "Club Leader",
    shortLabel: "Leader",
    eyebrow: "Club leader workspace",
    name: "Maya Chen",
    initials: "MC",
    college: "Northbridge College",
    greeting: "Your clubs are moving",
    description: "Keep your community in sync, review new members, and make the next event count.",
    primaryAction: "Create an event",
    secondaryAction: "Review requests",
    nav: [
      { label: "Overview", icon: "layout" },
      { label: "My clubs", icon: "users", count: "2" },
      { label: "Requests", icon: "inbox", count: "6" },
      { label: "Events", icon: "calendar" },
      { label: "Attendance", icon: "check-circle" },
      { label: "Achievements", icon: "award" },
    ],
    stats: [
      { label: "Active members", value: "128", detail: "+8 this month", icon: "users", tone: "teal" },
      { label: "Pending requests", value: "06", detail: "Needs a review", icon: "inbox", tone: "coral" },
      { label: "Upcoming events", value: "04", detail: "Next: Thu, 4:30 PM", icon: "calendar", tone: "violet" },
      { label: "Attendance rate", value: "92%", detail: "+4% this month", icon: "trend", tone: "amber" },
    ],
  },
  admin: {
    label: "College Admin",
    shortLabel: "Admin",
    eyebrow: "College admin workspace",
    name: "Jordan Lee",
    initials: "JL",
    college: "Northbridge College",
    greeting: "Northbridge at a glance",
    description: "A clear pulse on participation, imports, and the people powering your campus community.",
    primaryAction: "Import data",
    secondaryAction: "Open reports",
    nav: [
      { label: "Overview", icon: "layout" },
      { label: "Imports", icon: "upload", count: "3" },
      { label: "Students", icon: "users" },
      { label: "Clubs", icon: "building" },
      { label: "Events", icon: "calendar" },
      { label: "Attendance", icon: "check-circle" },
      { label: "Audit", icon: "clipboard" },
      { label: "Settings", icon: "settings" },
    ],
    stats: [
      { label: "Active students", value: "2,481", detail: "+12% vs last term", icon: "users", tone: "teal" },
      { label: "Live clubs", value: "86", detail: "+5 this month", icon: "building", tone: "coral" },
      { label: "Import queue", value: "03", detail: "1 needs attention", icon: "upload", tone: "violet" },
      { label: "Attendance capture", value: "94%", detail: "Across 28 events", icon: "check-circle", tone: "amber" },
    ],
  },
};

export const studentEvents: EventItem[] = [
  {
    day: "TODAY",
    date: "18",
    title: "Design thinking sprint",
    club: "Product Society",
    time: "4:30 PM – 6:00 PM",
    location: "Innovation Lab",
    description: "Work through a guided product challenge with peers from across campus.",
    tone: "coral",
  },
  {
    day: "THU",
    date: "20",
    title: "Open robotics workshop",
    club: "Northbridge Robotics",
    time: "5:00 PM – 7:00 PM",
    location: "Engineering Hall",
    description: "Bring a curious mind and build a small autonomous rover with the robotics team.",
    tone: "teal",
  },
  {
    day: "SAT",
    date: "22",
    title: "Campus voices showcase",
    club: "Student Arts Collective",
    time: "7:00 PM – 9:00 PM",
    location: "The Atrium",
    description: "A welcoming evening of student performances, short films, and live storytelling.",
    tone: "violet",
  },
];

export const recommendedClubs: ClubItem[] = [
  {
    name: "Northbridge Robotics",
    category: "Technology",
    members: "248 members",
    description: "Build, test, and learn together through hands-on projects.",
    initials: "NR",
    tone: "teal",
  },
  {
    name: "Climate Action Network",
    category: "Community",
    members: "134 members",
    description: "Turn small campus choices into lasting local impact.",
    initials: "CA",
    tone: "amber",
  },
  {
    name: "Student Arts Collective",
    category: "Creative",
    members: "96 members",
    description: "A welcoming stage for makers, performers, and storytellers.",
    initials: "SA",
    tone: "violet",
  },
];

export const leaderRequests: RequestItem[] = [
  { name: "Arjun Patel", club: "Northbridge Robotics", time: "12 min ago", context: "Interested in the beginner build team and Thursday workshop.", initials: "AP", tone: "teal" },
  { name: "Sofia Williams", club: "Northbridge Robotics", time: "1 hr ago", context: "Has experience with CAD and wants to help with community workshops.", initials: "SW", tone: "coral" },
  { name: "Ethan Brooks", club: "Product Society", time: "3 hrs ago", context: "Hopes to join the product critique circle this term.", initials: "EB", tone: "violet" },
];

export const leaderEvents: EventItem[] = [
  {
    day: "THU",
    date: "20",
    title: "Open robotics workshop",
    club: "Northbridge Robotics",
    time: "5:00 PM – 7:00 PM",
    location: "Engineering Hall",
    description: "Bring a curious mind and build a small autonomous rover with the robotics team.",
    tone: "teal",
  },
  {
    day: "SAT",
    date: "22",
    title: "Product teardown night",
    club: "Product Society",
    time: "6:30 PM – 8:00 PM",
    location: "Studio 04",
    description: "A hands-on teardown of a familiar campus product, followed by an open critique.",
    tone: "coral",
  },
];

export const adminImports: ImportItem[] = [
  { name: "students-fall-2025.xlsx", type: "Student roster", status: "Ready to review", rows: "2,481 rows", fileSize: "412 KB", validationMessage: "2 rows have a missing program code and need review before a real import.", tone: "teal" },
  { name: "clubs-and-leaders.xlsx", type: "Clubs & roles", status: "Imported", rows: "86 rows", fileSize: "38 KB", validationMessage: "All sample rows pass the preview checks.", tone: "violet" },
  { name: "events-october.xlsx", type: "Events", status: "Needs attention", rows: "142 rows", fileSize: "71 KB", validationMessage: "3 duplicate event rows were flagged for a coordinator to resolve.", tone: "coral" },
];

export const adminActivity = [
  { title: "Clubs & roles import completed", detail: "86 records · 8 minutes ago", icon: "check-circle" as IconName, tone: "teal" as Tone },
  { title: "New club leader assigned", detail: "Northbridge Robotics · 42 minutes ago", icon: "user" as IconName, tone: "violet" as Tone },
  { title: "Events file needs review", detail: "3 duplicate rows · 1 hour ago", icon: "file" as IconName, tone: "coral" as Tone },
];

export const notifications: NotificationItem[] = [
  {
    id: "event-reminder",
    title: "Your robotics workshop is Thursday",
    detail: "Northbridge Robotics · Engineering Hall",
    time: "12 min ago",
    target: "event",
    targetKey: "Open robotics workshop",
    tone: "teal",
  },
  {
    id: "membership-request",
    title: "A new membership request needs review",
    detail: "Arjun Patel · Northbridge Robotics",
    time: "18 min ago",
    target: "request",
    targetKey: "Arjun Patel",
    tone: "coral",
  },
  {
    id: "import-review",
    title: "Events import has 3 duplicate rows",
    detail: "events-october.xlsx · Ready for review",
    time: "1 hr ago",
    target: "import",
    targetKey: "events-october.xlsx",
    tone: "amber",
  },
  {
    id: "preview-note",
    title: "CampusSphere preview is ready",
    detail: "Explore a role to see the synthetic workspace.",
    time: "Today",
    target: "feedback",
    targetKey: "preview-note",
    tone: "violet",
  },
];

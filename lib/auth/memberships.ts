export type MembershipRole = "student" | "club_leader" | "admin";

export type ActiveCollegeMembership = {
  membershipId: string;
  collegeId: string;
  collegeName: string;
  role: MembershipRole;
};

export type CollegeMembershipGroup = {
  collegeId: string;
  collegeName: string;
  roles: MembershipRole[];
};

export const membershipRoleLabels: Record<MembershipRole, string> = {
  student: "Student",
  club_leader: "Club leader",
  admin: "College admin",
};

const membershipRoleOrder: MembershipRole[] = ["admin", "club_leader", "student"];

type MembershipQueryResponse = {
  data: unknown;
  error: unknown;
};

type MembershipFilterBuilder = PromiseLike<MembershipQueryResponse> & {
  eq(column: string, value: string): MembershipFilterBuilder;
};

export type MembershipClient = {
  from(table: string): unknown;
};

export class MembershipReadError extends Error {
  constructor() {
    super("Unable to load active college memberships.");
    this.name = "MembershipReadError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readRole(value: unknown): MembershipRole | null {
  return value === "student" || value === "club_leader" || value === "admin" ? value : null;
}

function readCollege(value: unknown): { id: string; name: string; status: string } | null {
  const college = Array.isArray(value) ? value[0] : value;
  if (!isRecord(college)) {
    return null;
  }

  const id = readNonEmptyString(college.id);
  const name = readNonEmptyString(college.name);
  const status = readNonEmptyString(college.status);

  return id && name && status ? { id, name, status } : null;
}

/**
 * Convert the nested PostgREST response into a small, UI-safe data shape.
 * The database filters are repeated in code so inactive tenants never become
 * visible if a test double or a future API response is broader than expected.
 */
export function normalizeActiveCollegeMemberships(data: unknown): ActiveCollegeMembership[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((value): ActiveCollegeMembership[] => {
    if (!isRecord(value)) {
      return [];
    }

    const membershipId = readNonEmptyString(value.id);
    const collegeId = readNonEmptyString(value.college_id);
    const role = readRole(value.role);
    const membershipStatus = readNonEmptyString(value.status);
    const college = readCollege(value.colleges);

    if (
      !membershipId ||
      !collegeId ||
      !role ||
      membershipStatus !== "active" ||
      !college ||
      college.status !== "active" ||
      college.id !== collegeId
    ) {
      return [];
    }

    return [{ membershipId, collegeId, collegeName: college.name, role }];
  });
}

/**
 * Read active memberships and active college names in one RLS-backed query.
 * The relationship filter avoids a per-college lookup and the client passed
 * here must be the authenticated publishable-key client.
 */
export async function readActiveCollegeMemberships(
  client: MembershipClient,
  profileId: string,
): Promise<ActiveCollegeMembership[]> {
  const normalizedProfileId = readNonEmptyString(profileId);
  if (!normalizedProfileId) {
    throw new MembershipReadError();
  }

  const querySource = client.from("college_memberships");
  if (!isRecord(querySource) || typeof querySource.select !== "function") {
    throw new MembershipReadError();
  }

  const selectedQuery = (querySource as { select(columns: string): unknown }).select(
    "id,college_id,role,status,colleges!inner(id,name,status)",
  );
  if (!isRecord(selectedQuery) || typeof selectedQuery.eq !== "function" || typeof selectedQuery.then !== "function") {
    throw new MembershipReadError();
  }

  const response = await (selectedQuery as unknown as MembershipFilterBuilder)
    .eq("profile_id", normalizedProfileId)
    .eq("status", "active")
    .eq("colleges.status", "active");

  if (response.error) {
    throw new MembershipReadError();
  }

  return normalizeActiveCollegeMemberships(response.data);
}

export function groupMembershipsByCollege(memberships: ActiveCollegeMembership[]): CollegeMembershipGroup[] {
  const groups = new Map<string, CollegeMembershipGroup>();

  for (const membership of memberships) {
    const existing = groups.get(membership.collegeId);
    if (existing) {
      if (!existing.roles.includes(membership.role)) {
        existing.roles.push(membership.role);
      }
      continue;
    }

    groups.set(membership.collegeId, {
      collegeId: membership.collegeId,
      collegeName: membership.collegeName,
      roles: [membership.role],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      roles: [...group.roles].sort((left, right) => membershipRoleOrder.indexOf(left) - membershipRoleOrder.indexOf(right)),
    }))
    .sort((left, right) => left.collegeName.localeCompare(right.collegeName));
}

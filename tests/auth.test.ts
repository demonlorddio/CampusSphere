import assert from "node:assert/strict";
import test from "node:test";

import { getSupabaseConfig } from "../lib/supabase/config";
import {
  groupMembershipsByCollege,
  normalizeActiveCollegeMemberships,
  type ActiveCollegeMembership,
} from "../lib/auth/memberships";
import {
  LOGIN_PASSWORD_MAX_LENGTH,
  LOGIN_PASSWORD_MIN_LENGTH,
  validateLoginInput,
} from "../lib/auth/validation";

test("Supabase config accepts only safe public project settings", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://campus.example";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_synthetic";
    assert.deepEqual(getSupabaseConfig(), {
      url: "https://campus.example",
      publishableKey: "sb_publishable_synthetic",
    });

    for (const [url, key] of [
      ["http://campus.example", "sb_publishable_synthetic"],
      ["https://campus.example/private", "sb_publishable_synthetic"],
      ["https://campus.example?token=secret", "sb_publishable_synthetic"],
      ["https://campus.example", "service_role_synthetic"],
      ["https://campus.example", "eyJhbGciOiJIUzI1NiJ9.synthetic"],
    ]) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
      assert.equal(getSupabaseConfig(), null);
    }

    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_local";
    assert.deepEqual(getSupabaseConfig(), {
      url: "http://127.0.0.1:54321",
      publishableKey: "sb_publishable_local",
    });
  } finally {
    if (previousUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    }

    if (previousKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
    }
  }
});

test("login input normalizes email without exposing the password", () => {
  const result = validateLoginInput({
    email: "  Student@College.edu ",
    password: "synthetic-password",
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      email: "student@college.edu",
      password: "synthetic-password",
    },
  });

  const invalid = validateLoginInput({ email: "not-an-email", password: "short" });
  assert.equal(invalid.ok, false);
  assert.equal("password" in invalid ? invalid.password : false, false);
});

test("login validation enforces password bounds without echoing input", () => {
  const tooShort = validateLoginInput({ email: "student@college.edu", password: "x".repeat(LOGIN_PASSWORD_MIN_LENGTH - 1) });
  const tooLong = validateLoginInput({ email: "student@college.edu", password: "x".repeat(LOGIN_PASSWORD_MAX_LENGTH + 1) });

  assert.deepEqual(tooShort, { ok: false, message: "Enter a valid password and try again." });
  assert.deepEqual(tooLong, { ok: false, message: "Enter a valid password and try again." });
});

test("membership normalization keeps only active, tenant-consistent rows", () => {
  const result = normalizeActiveCollegeMemberships([
    {
      id: "membership-a",
      college_id: "college-a",
      role: "student",
      status: "active",
      colleges: { id: "college-a", name: "North Campus", status: "active" },
    },
    {
      id: "membership-b",
      college_id: "college-a",
      role: "admin",
      status: "active",
      colleges: { id: "college-a", name: "North Campus", status: "active" },
    },
    {
      id: "inactive-membership",
      college_id: "college-b",
      role: "student",
      status: "revoked",
      colleges: { id: "college-b", name: "South Campus", status: "active" },
    },
    {
      id: "inactive-college",
      college_id: "college-c",
      role: "student",
      status: "active",
      colleges: { id: "college-c", name: "Archived Campus", status: "archived" },
    },
    {
      id: "mismatched-college",
      college_id: "college-d",
      role: "student",
      status: "active",
      colleges: { id: "college-other", name: "Other Campus", status: "active" },
    },
  ]);

  assert.deepEqual(result, [
    {
      membershipId: "membership-a",
      collegeId: "college-a",
      collegeName: "North Campus",
      role: "student",
    },
    {
      membershipId: "membership-b",
      collegeId: "college-a",
      collegeName: "North Campus",
      role: "admin",
    },
  ]);
});

test("membership groups sort roles by privilege and colleges by name", () => {
  const memberships: ActiveCollegeMembership[] = [
    { membershipId: "b-student", collegeId: "college-b", collegeName: "South Campus", role: "student" },
    { membershipId: "a-student", collegeId: "college-a", collegeName: "North Campus", role: "student" },
    { membershipId: "a-admin", collegeId: "college-a", collegeName: "North Campus", role: "admin" },
  ];

  assert.deepEqual(groupMembershipsByCollege(memberships), [
    { collegeId: "college-a", collegeName: "North Campus", roles: ["admin", "student"] },
    { collegeId: "college-b", collegeName: "South Campus", roles: ["student"] },
  ]);
});

import { describe, expect, it } from "vitest";
import { DEMO_OWNER_ID } from "./seed";
import { isUuid, toOwnerIdColumn } from "./uuid";

const AUTH_UUID = "b1f4c2e8-3a5d-4e6f-8b9c-0d1e2f3a4b5c";

describe("M02 — owner_id uuid guard", () => {
  it("recognises a real auth uuid", () => {
    expect(isUuid(AUTH_UUID)).toBe(true);
    expect(isUuid(AUTH_UUID.toUpperCase())).toBe(true);
  });

  it("rejects non-uuid strings", () => {
    expect(isUuid(DEMO_OWNER_ID)).toBe(false);
    expect(isUuid("demo_owner")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid("b1f4c2e8-3a5d-4e6f-8b9c")).toBe(false);
  });

  it("passes a real auth uuid through to the column", () => {
    expect(toOwnerIdColumn(AUTH_UUID)).toBe(AUTH_UUID);
  });

  it("writes persona placeholders as null instead of an invalid uuid", () => {
    expect(toOwnerIdColumn(DEMO_OWNER_ID)).toBeNull();
    expect(toOwnerIdColumn("demo_owner")).toBeNull();
    expect(toOwnerIdColumn("")).toBeNull();
    expect(toOwnerIdColumn(null)).toBeNull();
    expect(toOwnerIdColumn(undefined)).toBeNull();
  });
});

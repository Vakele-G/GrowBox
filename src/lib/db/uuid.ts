const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * `businesses.owner_id` is a uuid foreign key to `auth.users`, but the domain
 * keeps `Business.ownerId` as a plain string (the in-memory demo persona uses
 * "owner_demo_nomsa"). Anything that is not a real auth uuid is written as
 * NULL so Postgres never rejects the insert with an invalid-uuid error.
 */
export function toOwnerIdColumn(
  ownerId: string | null | undefined,
): string | null {
  return ownerId && isUuid(ownerId) ? ownerId : null;
}

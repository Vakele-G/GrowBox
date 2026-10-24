"use server";

import { createServerSupabaseClient } from "./db/client";
import { DEMO_EMAIL, type DemoSignInResult } from "./auth-types";

/**
 * Generates a magic-link for the seeded demo account through the service
 * client (creates the auth user on first use). The client then verifies the
 * OTP with the returned token hash, so no password ever leaves the server.
 */
export async function signInDemo(): Promise<DemoSignInResult> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: DEMO_EMAIL,
    options: { data: { demo: "true" } },
  });

  if (error || !data?.properties?.hashed_token) {
    return { ok: false, error: error?.message ?? "Demo sign-in could not be started." };
  }

  return {
    ok: true,
    hashedToken: data.properties.hashed_token,
    verificationType: data.properties.verification_type,
  };
}

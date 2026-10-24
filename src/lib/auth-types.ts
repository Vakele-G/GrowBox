export const DEMO_EMAIL = "demo@growbox.app";

export interface DemoSignInResult {
  ok: boolean;
  error?: string;
  hashedToken?: string;
  verificationType?: string;
}

import { runSeed } from "../src/lib/db/seed-run";

/**
 * Idempotent demo seed CLI: rebuilds Nomsa's Kitchen demo persona and history.
 * Safe to run multiple times — existing demo rows are removed before insert.
 *
 * `.env` is loaded by the `--env-file-if-exists` flag in package.json.
 *
 * Usage:
 *   npm run seed               # seeds full 30-day Stage 3 history
 *   npm run seed -- --minimal  # seeds minimal Stage 1 idea persona
 */
const mode = process.argv.includes("--minimal") ? "minimal" : "full";

runSeed(mode)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed error:", error);
    process.exit(1);
  });

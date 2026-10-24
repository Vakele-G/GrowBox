# Project Agent Instructions

## Mission
Build GrowBox as specified in PROJECT_SPEC.md, following the ordered
milestones in MILESTONES.md. The project is a hackathon entry: the demo
deadline is Sunday 25 October 2026. Optimise for a working, honest,
judge-ready demo over feature breadth.

## Workflow
- Read PROJECT_SPEC.md, MILESTONES.md, and this file first.
- Work on the earliest incomplete milestone, one at a time.
- Do not expand a milestone's scope. Ask the human only if a
  requirement is materially ambiguous; otherwise make a sensible
  choice, note it in the completion report, and keep going.
- After finishing a milestone, run the project's real test, lint,
  typecheck, and build commands. Fix failures before moving on.
- Never invent test results and never weaken tests to make them pass.
- Update MILESTONES.md with truthful status only and append the
  milestone to the log.
- When checks pass, publish with:
    scripts/commit-milestone.sh <ID> "<short description>"
  then continue directly to the next milestone. Do not wait for
  human approval between milestones.
- If checks fail and you cannot fix them, do not publish. Stop and
  report the problem.
- Obey the cut order in MILESTONES.md when time is short. Never cut
  the items marked "never cut".

## Git rules
- Work directly on main. No feature branches, no pull requests.
- scripts/commit-milestone.sh is the only way to commit and push.
  It sets the git author and SSH key, rotating between teammates.
- Never run git commit, git push, or git config yourself.
- Never force-push, rewrite history, or amend commits.
- Never read or print ~/.ssh or any key.

## Stack and commands
- Next.js (App Router) + TypeScript strict + Tailwind, deployed to Vercel.
- Supabase Postgres and auth; repository layer under `src/lib/db`.
- Pure domain logic under `src/lib/domain`; AI adapter under `src/lib/ai`.
- Tests with Vitest. PWA, mobile-first (360px baseline).
- Commands: `npm run dev`, `npm run build`, `npm run lint`,
  `npm run typecheck`, `npm run test`.

## Conventions
- Money is integer cents. Dates use `Africa/Johannesburg`; currency
  formatting uses `en-ZA`.
- Put costing, margins, runway, stage detection, nudge rules, and the
  Health Score in pure functions. The LLM may phrase and translate,
  never calculate.
- Every AI feature needs a deterministic fallback and an 8-second
  timeout. A missing API key must not break any user flow.
- Validate LLM output with Zod. Never write parsed transactions to the
  ledger without user confirmation.
- Compliance content must come from curated `knowledge_chunks` rows with
  `source_url` and `last_verified`, and must show the
  "Verify with your municipality" disclaimer.
- UI strings live in message files for English and isiZulu. Do not
  hard-code user-facing copy in components.
- Label simulated data in the UI (e.g. "Simulated FNB feed").

## Secrets and safety
- Never commit secrets, API keys, or personal data. Keep them in
  `.env` (git-ignored); keep placeholders in `.env.example`.
- Never ship the opencode agent key in the app or call it at runtime.
- Do not call real banking or payment APIs. The FNB integration is mock
  only unless the human explicitly provides sandbox credentials.
- Ask before installing major new dependencies or running destructive
  commands against shared data.

## Quality
- Follow existing conventions and prefer simple, maintainable code.
- Add or update tests for meaningful behaviour, especially every domain
  function.
- Keep seed scripts idempotent.
- Do not commit generated artifacts unless the project requires them.
- Milestone is done only when its stated checks pass and its
  deliverables are demoable.

## After each milestone, report briefly
1. Milestone ID and what was built.
2. Checks run and their actual results.
3. Known limitations.
4. Commit hash and push result, only after they succeeded.

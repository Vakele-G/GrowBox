# Milestones

Ordered build plan for GrowBox. Work on the earliest incomplete milestone.
Do not expand scope. Publish only after all checks pass.

**Status values:** `pending` · `in progress` · `done` · `skipped`

**Checks:** `npm run lint` · `npm run typecheck` · `npm run test` ·
`npm run build`

---

## M00 — Repository scaffolding

**Status:** done

Repo, agent instructions, and the milestone commit script are in place.

---

## M01 — Foundation and live deploy

**Status:** done

**Goal:** A deployed, tooled Next.js PWA skeleton with a public URL.

**Deliverables**
- Next.js (App Router) + TypeScript strict + Tailwind + ESLint + Vitest.
- Scripts: `dev`, `build`, `lint`, `typecheck`, `test`.
- `.gitignore` covers `.env*`, `node_modules`, `.next`, coverage.
- `.env.example` with placeholder keys; Supabase browser/server clients.
- PWA manifest and basic app shell; placeholder home screen.
- Deploy to Vercel; record the public URL in the completion report.

**Done when:** all checks pass and the public URL loads the app shell.

---

## M02 — Data model, demo auth and seed

**Status:** done

**Goal:** Persistent data with a reproducible demo persona.

**Deliverables**
- Migrations for all tables in PROJECT_SPEC.md §8, including constraints.
- RLS baseline scoped to the owning business; demo account created.
- Repository layer used by all screens (no ad-hoc SQL in components).
- Idempotent seed scripts: minimal onboarding persona and full Stage 3
  history (14 days, oil price increase, Health Score in the 60–70 band).
- Demo login documented in the submission notes (not in `.env`).

**Done when:** migrations apply cleanly, seed runs twice without duplicates,
and the demo account shows seeded data after login.

---

## M03 — Stage 1 wizard and costing calculator

**Status:** done

**Goal:** The hero feature: cost it, price it, plan the launch.

**Deliverables**
- Onboarding wizard: location, budget, equipment, customers.
- Practicality check and startup cost estimate from `plan_items`.
- Ingredient and equipment shopping list with pack prices.
- Unit economics: cost per unit, batch yield, gross margin, break-even,
  suggested price. Pure functions in `src/lib/domain`.
- Launch plan output saved to the business record.

**Done when:** unit tests cover costing, yield and break-even; a new user
completes the wizard and sees correct numbers for the demo inputs.

---

## M04 — Transaction logging and ledger

**Status:** done

**Goal:** Log a trading day in under 15 seconds, by typing.

**Deliverables**
- Quick-entry form for sales and expenses.
- Natural-language parse via the AI adapter, with fallback parser and
  mandatory confirmation step before saving.
- Source tagging (`manual`, `text`, `fnb`) and external-id dedupe.
- Ledger view with daily totals and edit/delete.

**Done when:** parser tests pass (fallback and mocked LLM), and the demo
phrase creates correct entries only after confirmation.

---

## M05 — Stage 3 dashboard and warnings

**Status:** done

**Goal:** Show Nomsa whether the business is actually making money.

**Deliverables**
- Profit and cash-flow trend (14/30 days).
- Cash runway, stock days of cover, savings buffer.
- Personal vs business money separation prompt.
- Deterministic warning calculations ready for the nudge engine.

**Done when:** unit tests cover runway, stock cover and buffer, and the
seeded persona produces the expected Thursday cash warning.

---

## M06 — Proactive engine and next best step

**Status:** pending

**Goal:** The app tells the user what to do next, unprompted.

**Deliverables**
- Stage detection rules and progress persistence.
- Nudge rules from PROJECT_SPEC.md §6.4, evaluated over ledger data.
- "Next best step" card on home; nudge inbox with done/dismiss.
- LLM phrasing in English and isiZulu with static template fallback.

**Done when:** rule tests pass, a stage transition can be triggered from
seeded data, and nudges render correctly with the LLM disabled.

---

## M07 — Health Score, FNB mock and credit record

**Status:** pending

**Goal:** Turn the ledger into a credit-readiness story.

**Deliverables**
- Deterministic Health Score with component breakdown and band.
- `TransactionSource` adapter; `MockFnbSource` producing statement-shaped
  lines, imported through the same pipeline with dedupe.
- "Simulated FNB feed" labelling and an import screen.
- Exportable/printable trading-history record with disclaimers.

**Done when:** score tests pass, importing the same mock statement twice
does not duplicate ledger entries, and the export renders.

---

## M08 — Mocked stages, demo polish and submission pack

**Status:** pending

**Goal:** A judge-ready demo.

**Deliverables**
- Stage 2 checklist screen with realistic, sourced-style content.
- Stage 4 screen: second-fryer affordability using real calculations.
- Stage 5 enterprise screen (pitch-only content).
- Scripted Stable → Grow transition wired to the seeded data.
- English/isiZulu copy review; empty, loading and error states.
- Backup demo video, screenshots, demo script and credentials.
- README updated with setup, demo login and architecture summary.

**Done when:** full checks pass, the demo runs end-to-end on a phone-sized
viewport, and the backup video exists.

---

## Cut Order (if time runs short)

Cut from the top, never from the bottom:

1. Stage 4 mocked affordability detail (keep a static screen).
2. Stage 5 screen (keep it as a Figma/pitch slide).
3. FNB import polish (keep a one-click seeded import).
4. isiZulu QA pass beyond the core nudge and dashboard strings.
5. Stage 2 checklist breadth (keep 5 strong tasks).

**Never cut:** live deploy, demo account and seed, Stage 1 wizard,
logging, dashboard, nudges, stage transition, backup video, credentials.

---

## Milestone Log

Append one line per published milestone: `MID — checks — commit — push`.
- M01 — lint, typecheck, test, build pass — 8dcc770 — pushed
- M02 — lint, typecheck, test, build pass — db369ab — pushed
- M03 — lint, typecheck, test, build pass — 68edd63 — pushed
- M04 — lint, typecheck, test, build pass — 314b8eb — pushed
- M05 — lint, typecheck, test, build pass — pending commit — pending push

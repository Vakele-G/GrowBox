# GrowBox

**From a street-side hustle to a bankable business.**

GrowBox is a mobile-first PWA mentor for South African informal entrepreneurs.
It watches the owner's own trading data and answers one question:

> "What is the next best step I should take to build my business?"

It is not a chatbot. The app works proactively — detecting the business stage,
flagging cash-flow danger, catching margin drops, and telling the owner what to
do next while building the financial track record a bank needs.

**Hackathon entry:** FNB App of the Year Hackathon 2026 · problem statement
"Youth entrepreneurship and small-business growth".

---

## The problem

Informal and township businesses cannot access credit or formal markets because
they have no paper trail. In South Africa:

- 1.9 million people run non-VAT-registered businesses (Stats SA, SESE 2023).
- 80% are unregistered and 77% manage finances manually (Standard Bank, 2025).
- Only 33% of businesses report access to credit (UNDP, 2024); the MSME
  financing gap is estimated at R350 billion (OECD, 2026).

GrowBox creates the paper trail as a by-product of helping the owner run the
business. See [SUBMISSION.md](SUBMISSION.md) for the full, sourced case.

## The journey

| Stage | What the owner gets |
|-------|---------------------|
| 1. Idea | Practicality check, startup costs, ingredient/equipment list, costing and pricing, launch plan. |
| 2. Launch | Personalised checklist: suppliers, trading location, food handling, registration, recordkeeping. |
| 3. Stable | Daily sales/expense tracking, profit and cash flow, stock guidance, savings buffer, early warnings. |
| 4. Grow | Equipment affordability, pricing and marketing, funding readiness, hiring obligations. |
| 5. Enterprise | Formalisation, funding documents, new outlets, wholesale, projections. |

**Hackathon build scope:** Stages 1 and 3 fully working; Stages 2, 4 and 5 as
navigable previews; a scripted Stage 3 → Stage 4 transition; English and
isiZulu. Full detail in [PROJECT_SPEC.md](PROJECT_SPEC.md).

## Key features

- **Costing and pricing calculator** — cost per unit, batch yield, margin,
  break-even and a suggested price, recomputed when ingredient prices move.
- **15-second logging** — type "I sold 40 gwinyas and bought oil for R180" and
  confirm the parsed entries.
- **Proactive nudges** — margin drops, cash-runway warnings, stock cover,
  savings buffer, stage transitions.
- **Business Health Score** — a deterministic 0–100 credit-readiness signal with
  a component breakdown.
- **Verified trading-history record** — an exportable summary for a lender.
- **Simulated FNB feed** — statement-shaped transactions through the same
  ledger as manual entry, labelled honestly in the UI.
- **Grounded compliance** — sourced municipal content with a "verify with your
  municipality" link.

## Stack

- **App:** Next.js (App Router), TypeScript strict, Tailwind CSS, PWA.
- **Data and auth:** Supabase Postgres with Row-Level Security.
- **Domain logic:** pure TypeScript under `src/lib/domain` (costing, margins,
  runway, stage detection, nudge rules, Health Score).
- **AI:** adapter under `src/lib/ai` (Gemini structured output), with a
  deterministic fallback for every feature.
- **Hosting:** Vercel.
- **Tests:** Vitest. **Lint:** ESLint. **Types:** `tsc --noEmit`.

```
src/
  app/            routes, screens, server actions
  lib/
    domain/       pure business logic (no UI, no AI)
    ai/           parseLog, phraseNudge, translate, explain + fallbacks
    db/           Supabase clients and repositories
  messages/       English and isiZulu UI strings
```

## Getting started

Requirements: Node.js 20+, npm, and a Supabase project.

```bash
cp .env.example .env      # fill in the values
npm install
npm run dev
```

Environment variables (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | AI parsing and phrasing. Optional: the app works without it. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only — seed and admin tasks. |

Commands:

```bash
npm run dev        # local development
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest
```

**Never commit `.env`.** Secrets live only in local env files and Vercel
environment variables.

## Demo

The demo uses a seeded persona — Nomsa's Kitchen, a Soweto amagwinya and slap
chips business with 14 days of trading history. The seed script is idempotent.

- Deployed URL: added at milestone M01.
- Demo credentials: recorded in the submission pack, not in this repository.

## Project documentation

- [PROJECT_SPEC.md](PROJECT_SPEC.md) — scope, architecture, data model, AI and
  security design, demo script.
- [MILESTONES.md](MILESTONES.md) — ordered build plan and cut order.
- [SUBMISSION.md](SUBMISSION.md) — hackathon answers with sources.
- [SECURITY.md](SECURITY.md) — SSDLC: risk assessment, threat model, secure
  development, testing and integration.
- [AGENTS.md](AGENTS.md) — working conventions and commands.

## Design principles

1. **Code calculates, AI explains.** Every number comes from tested pure
   functions; the LLM only phrases and translates.
2. **Every AI feature has a deterministic fallback** and an 8-second timeout.
   A missing API key never breaks a user flow.
3. **Never write an unconfirmed transaction.** Parsed entries require user
   confirmation before they reach the ledger.
4. **Grounded compliance.** Sourced content with `source_url` and
   `last_verified`, plus a "verify with your municipality" disclaimer.
5. **Label simulated data.** The FNB feed is a mock and says so.
6. **Built for reality.** Low data, entry-level Android, text-first, English and
   isiZulu.

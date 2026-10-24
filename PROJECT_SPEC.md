# GrowBox — Project Specification

**Event:** FNB App of the Year Hackathon 2026 (23–25 October 2026)
**Problem statement:** Youth entrepreneurship and small-business growth
**Submission category:** Best Hackathon Solution

---

## 1. Vision

GrowBox takes a South African entrepreneur from a business idea to a
sustainable, growing, bankable business. An AI mentor works proactively,
so the user never has to know what to ask a chatbot.

**Central question the app answers:**
"What is the next best step I should take to build my business?"

**Pitch line:**
"We turn a street-side hustle into a bankable business by building the
financial track record banks need, while teaching the owner what to do next."

**Structural problem:** Informal and township businesses cannot access
credit or formal markets because they have no paper trail. GrowBox creates
that trail as a by-product of helping the owner run the business.

---

## 2. Persona

**Nomsa, 24, Soweto.** Wants to sell amagwinya and slap chips in her
community. She has about R1,500 in savings. She does not know how to cost,
price, equip, comply, or grow. Today she pieces together YouTube, Google,
friends, and trial and error.

The product is designed around young founders (18–35) but serves any
entrepreneur, and allows joining at any stage.

---

## 3. The Journey

| Stage | Name | What the user gets |
|-------|------|--------------------|
| 1 | Idea | Location, budget, equipment and customer questions; practicality check; startup cost estimate; ingredient and equipment list; pricing and profit calculation; launch plan. |
| 2 | Launch | Personalised checklist: suppliers and ingredient costs, trading location, food-handling and municipal requirements, when to register, basic recordkeeping, launch budget. Every task explains what it is, why it matters, and what to do next. |
| 3 | Stable | Daily sales and expense tracking; profit and cash flow; stock quantity guidance; separating business and personal money; savings buffer; early warnings. |
| 4 | Grow | Affordability of new equipment (e.g. commercial fryer); sales needed to justify it; pricing and marketing improvements; business accounts and funding readiness; hiring and employment obligations. |
| 5 | Enterprise | Formalisation, funding documents, new outlets or wholesale, supplier relationships, projections. |

---

## 4. Hackathon Scope

### Fully working
- **Stage 1 (Idea):** complete wizard and outputs.
- **Stage 3 (Stable):** transaction logging, dashboard, warnings, nudges.
- **Proactive engine:** stage detection, rule-driven nudges, "next best step".
- **Business Health Score** and credit-readiness record.
- **Mock FNB transaction feed** feeding the same ledger as manual entry.
- **English + isiZulu**, typed input.

### Mocked screens (navigable, clearly marked "Preview")
- Stage 2 checklist (populated with realistic content).
- Stage 4 grow screen (equipment affordability uses real calculations where cheap).
- Stage 5 enterprise screen (pitch-only content).

### Scripted centrepiece
Nomsa logs two weeks of trading → GrowBox detects she is ready to grow →
recommends a second fryer with an affordability and payback calculation.

### Explicitly out of scope
Voice/speech-to-text, WhatsApp, USSD, supplier price comparison, fraud and
scam detection, vector-search RAG, live FNB APIs, Stage 5 build-out,
business-plan generation, multilingual beyond English and isiZulu.

---

## 5. Judging Alignment

The FNB FAQ scores Product, Creativity, Usability, Sustainability, Impact,
Presentation and **Intelligence**.

| Criterion | How GrowBox scores |
|-----------|--------------------|
| Intelligence | Deterministic stage detection, cash-runway forecasting, margin-drop detection, Health Score, proactive next-best-step. |
| Product | Deployed URL, seeded demo account, working Stage 1 and Stage 3, honest labelling of mocked stages. |
| Usability | Mobile-first PWA, 3-tap logging, plain language, every nudge explains why and what to do. |
| Impact | Credit access for thin-file informal businesses; township economy. |
| Sustainability | FNB customer acquisition, better credit-risk data, path to business-account conversion. |
| Creativity | Proactive mentor rather than chatbot; paper trail as a by-product. |
| Presentation | 5-minute scripted demo, backup video, architecture slide. |

Judges load the app on their own devices, so a **public URL with a demo
login** is mandatory. Remote access and credentials are submitted.

---

## 6. Functional Requirements

### 6.1 Costing and pricing calculator (hero feature)
- Ingredients with pack size, pack price, and unit; recipes describe
  quantity per product unit.
- Batch yield support (e.g. one batch of dough makes 30 amagwinya).
- Outputs: cost per unit, gross margin, break-even units/day, suggested
  selling price rounded to a market-friendly price point.
- Recomputes when an ingredient price changes (drives the margin nudge).
- All values in integer cents. All maths in pure functions, unit-tested.

### 6.2 Transaction logging
- Quick entry form for sales and expenses.
- Natural-language parse: "I sold 40 gwinyas and bought oil for R180" →
  structured entries with a **confirmation step before saving**.
- Tags every entry with source: `manual`, `text`, or `fnb`.
- Daily totals and a simple ledger view.

### 6.3 Stage 3 dashboard
- Profit and cash-flow trend (last 14/30 days).
- Cash runway: days until cash cannot cover the next restock.
- Stock guidance: days of cover at current sales rate.
- Savings buffer: business cash vs one week of expenses.
- Personal vs business money separation prompt.

### 6.4 Proactive engine
Rules run in plain TypeScript over ledger data. The LLM only phrases the
result in the user's language.

Default triggers (thresholds configurable in one module):
- Margin dropped ≥ 5 percentage points week-on-week (e.g. oil price up).
- Cash runway < 3 days.
- Stock cover < 1 day at current sales rate.
- Savings buffer < 1 week of expenses.
- No transactions logged for 2 days.
- Stage-transition criteria met.

Stage-detection defaults:
- **Idea → Launch:** launch plan generated and startup budget saved.
- **Launch → Stable:** ≥ 10 trading days with sales in the last 21 days.
- **Stable → Grow:** 30+ days of trading, positive 4-week margin,
  logging on ≥ 20 of the last 30 days, savings buffer ≥ 1 week.
- **Grow → Enterprise:** 60+ days of consistent history and formalisation
  tasks started (pitch-only in this build).

### 6.5 Business Health Score
0–100, deterministic, with named components and an explanation. Used as a
credit-readiness signal and shown with a "what improves this" list.

| Component | Weight |
|-----------|--------|
| Profitability (4-week margin) | 25 |
| Cash buffer / runway | 20 |
| Record consistency | 20 |
| Margin stability | 15 |
| Savings discipline | 10 |
| Compliance progress | 10 |

Bands: 0–39 Building, 40–59 Emerging, 60–79 Bankable-track, 80–100 Ready.

### 6.6 Trading history / credit-readiness record
A clean, printable/exportable summary: period, number of trading days,
total sales, total expenses, average margin, cash-flow consistency,
Health Score and component breakdown. Clearly labelled **simulated data**
in the demo.

### 6.7 FNB integration (mock, honestly labelled)
- One ingestion pipeline: normalise → dedupe by external id → ledger.
- `TransactionSource` adapter interface; `MockFnbSource` generates
  statement-shaped lines (date, description, amount, balance, reference,
  direction) on demand.
- UI labels the feed "Simulated FNB feed" and the pitch names the real
  FNB Statements API / transaction-notification endpoints and the eWallet
  cash-send flow where production data would plug in.

### 6.8 Language and accessibility
- English and isiZulu UI, language switcher, persisted choice.
- Currency `en-ZA`, dates `Africa/Johannesburg`.
- Text-first, low-data design; no decorative media required.
- Tap targets ≥ 44px, readable contrast, no colour-only status cues.

---

## 7. Architecture

```
Next.js PWA (App Router, TypeScript strict, Tailwind)
  ├─ UI screens / server actions / route handlers
  ├─ src/lib/domain   pure TS: costing, margins, cash-flow, runway,
  │                   stage detection, nudge rules, health score
  ├─ src/lib/ai       adapter: parseLog, phraseNudge, translate, explain
  │                   provider: Gemini JSON output
  │                   fallback: rule parser + template strings
  └─ src/lib/db       repositories over Supabase Postgres (RLS)
Deploy: Vercel (public URL) · DB/Auth: Supabase
Tests: Vitest · Lint: ESLint · Types: tsc --noEmit
```

- No LLM call may block a user flow; every AI feature has a deterministic
  fallback and an 8-second timeout.
- Domain logic never imports UI or AI modules.
- Secrets only in `.env` / Vercel env vars: `GEMINI_API_KEY`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`. `.env.example` documents placeholders.
- The opencode agent key is not an application runtime key and must never
  be shipped in the app.

---

## 8. Data Model

Postgres, snake_case, money as integer cents, dates as `date`/`timestamptz`.

| Table | Key columns |
|-------|-------------|
| `businesses` | id, owner_id → auth.users, name, stage, municipality, language, monthly_budget_cents, onboarding (jsonb), created_at |
| `products` | id, business_id, name, unit_label, selling_price_cents, batch_yield, is_active |
| `ingredients` | id, business_id, name, pack_size, pack_unit, pack_price_cents, last_price_change_at |
| `product_ingredients` | product_id, ingredient_id, qty_per_unit |
| `transactions` | id, business_id, occurred_on, type (sale/expense), category, amount_cents, description, product_id, quantity, source (manual/text/fnb), external_id, confidence, created_at |
| `plan_items` | id, business_id, kind (equipment/ingredient/task), label, est_cost_cents, status, sort_order |
| `stage_progress` | business_id, stage, stage_started_at, completed_checks (jsonb), updated_at |
| `nudges` | id, business_id, rule_key, severity, payload (jsonb), message_en, message_zu, status (new/seen/done/dismissed), created_at |
| `health_scores` | id, business_id, score, components (jsonb), computed_at |
| `knowledge_chunks` | id, jurisdiction, topic, title, requirement, source_url, last_verified, disclaimer |

Constraints: `unique (business_id, external_id)` on transactions for
idempotent FNB ingestion; RLS scopes every row to the owner's business.

---

## 9. AI Design

**Principles**
1. **The AI explains; code calculates.** Costing, margins, projections,
   runway, stage detection and the Health Score are plain TypeScript.
2. **Structured output only.** The LLM returns JSON validated with Zod;
   invalid output falls back, never renders raw text into data fields.
3. **Grounded compliance.** Answers come from curated `knowledge_chunks`
   rows with `source_url` and `last_verified`. The UI always shows the
   source and "Verify with your municipality." No free-form legal advice.
4. **Disclosure.** The app states that AI can make mistakes and that
   requirements vary by municipality.
5. **Safety on write paths.** Parsed transactions are always confirmed by
   the user before they hit the ledger.

**Interfaces**
```ts
parseLog(text, ctx): Promise<ParsedEntry[]>   // fallback: regex + guided form
phraseNudge(ruleKey, payload, lang): Promise<string> // fallback: templates
translate(key, lang): Promise<string>          // fallback: static messages
explain(metric, payload, lang): Promise<string> // fallback: templates
```

**Fallbacks**
- Regex parser covers the demo phrases ("sold 40 gwinyas", "bought oil for
  R180") plus a quick-entry form for everything else.
- Nudge and explanation copy exists as English and isiZulu templates.
- If `GEMINI_API_KEY` is absent, the app remains fully demoable.

---

## 10. Seed Data (Demo Account)

- Business "Nomsa's Kitchen", Soweto, Stage 3, isiZulu/English.
- Products: amagwinya (R5), slap chips small (R20), slap chips large (R30).
- Ingredients with realistic pack prices; one recent oil price increase to
  trigger the margin nudge.
- 14 consecutive days of sales and expenses, enough to trigger the Stable →
  Grow transition and a Health Score around 60–70.
- Two-stage seed script: minimal profile (onboarding demo) and full history
  (Stage 3 demo). Idempotent: safe to run twice.

---

## 11. Demo Script (5 minutes)

1. **Login** with the demo account → home shows the next best step.
2. **Stage 1 wizard**: location, R1,500 budget, equipment, customers →
   practicality check, startup cost, shopping list, cost per gwinya,
   suggested price. (~90s)
3. **Log a sale by typing** "I sold 40 gwinyas and bought oil for R180" →
   confirmation card → ledger and dashboard update.
4. **Nudge**: oil price up → margin down 12% → new price or bulk-buy
   suggestion, in English and isiZulu.
5. **Cash warning**: "At this rate you'll run out of cash for stock on
   Thursday" with the calculation shown.
6. **Stage transition**: seeded two weeks of trading → "You're ready to
   grow" → second-fryer affordability and payback.
7. **Health Score + credit story**: score breakdown → simulated FNB feed
   import → exportable trading history.
8. **Mocked previews**: Stage 2 checklist, Stage 5 enterprise screen, then
   close on the FNB business-case slide.

Rehearse twice. Record a backup video. Keep the seeded demo account clean
and reset it before submission.

---

## 12. Quality Bar

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
  must pass before any milestone is published.
- Unit tests for every domain function: costing, batch yield, margin,
  break-even, runway, stock cover, stage detection, nudge rules, score.
- Parser tests: fallback parser plus a mocked LLM response; confirmation
  required before persistence.
- Idempotent seed verified by running it twice.
- PWA manifest + installable; app usable at 360px width.
- No secrets in git. No `any` in domain code.

---

## 13. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Time overrun (≈30h) | Hard cut order in MILESTONES.md; deploy in M01; mocked screens kept thin. |
| No LLM API key | Free Gemini key obtained early; every AI path has a deterministic fallback. |
| LLM latency or failure during demo | 8s timeout, cached/seed nudges, typed fallback, backup video. |
| Supabase setup blocks progress | Fallback to Neon Postgres + Drizzle with the same repository interface. |
| Judges cannot access app | Public Vercel URL, demo credentials in the submission pack, guest/demo login. |
| Compliance inaccuracy | Curated sourced rows, visible disclaimer, no generated legal advice. |
| Demo looks empty | Seeded persona with two weeks of trading, reset before submission. |
| Scope creep | Anything not in Section 6 is out; new ideas go to the roadmap. |

---

## 14. Post-Hackathon Roadmap

1. Voice logging (Whisper or Gemini audio) with English/isiZulu QA.
2. Real FNB Statements API and eWallet ingestion with consent and KYC.
3. WhatsApp Business channel for logging and nudges.
4. Vector search (pgvector) over a larger, reviewed compliance corpus.
5. Full Stage 2, 4 and 5 workflows, including supplier marketplace and
   hiring obligations.
6. Multi-business accounts, export for lenders, and a lender-side view.
7. Fraud/scam protection for fake suppliers, payment screenshots and
   funding offers.

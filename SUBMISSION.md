# GrowBox — Hackathon Submission Answers

FNB App of the Year Hackathon 2026 · Problem statement: Youth entrepreneurship
and small-business growth · Category: Best Hackathon Solution

> Figures are cited for judges to verify. Confirm pricing and targets with the
> team before submitting. Sources are listed at the end.

---

## 1. Problem Statement (backed by evidence)

South Africa has 1.9 million people running non-VAT-registered businesses
(Stats SA, SESE 2023), and the informal sector absorbs about 20–21% of all
employment (Stats SA QLFS Q4 2024; TIPS Q1 2026) inside a township economy
worth roughly R900 billion a year. These businesses are structurally invisible
to the formal financial system: 80% are unregistered, 77% manage their finances
manually and only 5% use any accounting software (Standard Bank Township
Informal Economy Report, Oct 2025), and just 59% keep financial records at all
(FinScope MSME 2024). That absence of a paper trail is the binding constraint —
only 33% of South African businesses report having access to credit (UNDP,
2024), the MSME financing gap is estimated at R350 billion (OECD, 2026), and
while 85% of funding applications come from businesses with turnover under R1m,
50.9% of those owners have below-average personal credit scores because they
burn personal credit to keep trading (SA MSME Access to Finance Report, 2025).

The people suffering are young, first-time, necessity-driven founders —
overwhelmingly women — trading from streets and homes: 43.8% of South Africans
aged 15–34 are unemployed (Stats SA Q4 2025), and more than 70% of SMMEs fail
within five to seven years, with South Africa ranked 47th of 49 economies for
entrepreneurial conditions (GEM 2023). Their pain points are concrete and
daily: they cannot cost a product, so margins silently collapse when input
prices move; they have no cash-flow view, so they run out of stock money
mid-week; they mix business and personal cash; they cannot work out which
permits or certificates their municipality requires; and they have no
lender-ready trading history, so banks price them as unbankable. Advice exists,
but it is scattered across YouTube, WhatsApp forwards and word of mouth, and it
is generic — nobody tells them *their* next best step using *their* numbers.
Crucially, reactive tools fail this user: she does not know what to ask a
chatbot.

---

## 2. Solution & Features

**GrowBox** is a mobile-first PWA mentor that takes an entrepreneur from idea to
bankable business. It is not a chatbot and not an accounting package: it is a
**proactive engine** that watches the founder's own trading data and always
answers one question — *"What is the next best step I should take?"* The
financial track record banks need is created as a by-product of helping her run
the business.

**Key features**

- **Stage-aware journey (Idea → Launch → Stable → Grow → Enterprise):** join at
  any stage; the app detects which stage your data supports and moves you
  forward.
- **Costing & pricing calculator (hero):** ingredient packs, recipes and batch
  yield → cost per unit, gross margin, break-even units/day, and a
  market-friendly suggested price. Recalculates the moment an ingredient price
  changes.
- **15-second logging:** type "I sold 40 gwinyas and bought oil for R180" and
  GrowBox parses it into ledger entries with a confirm-before-save step. Voice
  is on the roadmap.
- **Profit & cash-flow dashboard:** daily sales/expenses, margin trend, stock
  days-of-cover, savings buffer, and a cash-runway warning ("at this rate
  you'll run out of stock money on Thursday").
- **Proactive nudges:** rule-driven alerts such as "your gwinya margin dropped
  12% because oil went up — here's a new price" or "raise R180 this week to
  protect your buffer."
- **Business Health Score (0–100):** profitability, cash buffer, record
  consistency, margin stability, savings discipline and compliance progress —
  doubling as a **credit-readiness signal**.
- **Verified trading-history record:** an exportable, period-stamped summary a
  lender can actually assess.
- **Grounded compliance:** municipal trading permits, Certificate of
  Acceptability, CIPC/SARS basics from curated, sourced entries with a "verify
  with your municipality" link.
- **Bank feed integration:** transactions flow in from a business account or
  eWallet/cash-send rather than being typed (simulated in this build, with the
  real integration point shown).
- **English + isiZulu**, low-data, works on entry-level Android; no
  installation friction.

**Safety design judges should notice:** all costing, margin, runway,
stage-detection and scoring maths is deterministic, tested code. The AI phrases
and translates — it never calculates. Every AI feature has a deterministic
fallback.

---

## 3. Unique Value Proposition

Most tools give informal traders *information*; GrowBox gives *decisions*, in
their language, from their own numbers.

- **Proactive, not reactive.** She never has to know what to ask. The app tells
  her the next best step before she thinks to look for it — the opposite of a
  chatbot, a business-plan generator, or a generic course.
- **The paper trail is a by-product.** Every other product asks the founder to
  do bookkeeping *for the bank's benefit*. GrowBox builds the bankable record
  while she simply runs her day — so compliance with recordkeeping stops being
  a chore and starts being automatic.
- **Trustworthy numbers.** Deterministic, auditable maths behind every figure,
  with the AI only explaining it. No hallucinated margins, no invented legal
  requirements — sourced compliance content with verification links.
- **Designed for the actual user,** not the Silicon Valley one: isiZulu,
  text-first, low-data, R399 Android, cash-and-eWallet reality.
- **One continuous journey** from "I have R1,500 and an idea" to "here is my
  funding pack" — competitors serve only one slice (accounting, or courses, or
  lending marketplaces).

---

## 4. Unfair Advantage

- **A proprietary data asset nobody else can assemble.** Banks hold statement
  lines; they do not hold unit-level economics — cost per gwinya, batch yield,
  margin per product, stock cover, restock cadence — for informal traders.
  GrowBox accumulates exactly that, verified by the owner's own daily
  confirmation. That is a genuinely new input for thin-file credit assessment.
- **A compounding data network effect.** More traders → better local benchmarks
  (an ingredient price index, margin and seasonality benchmarks by township and
  sector) → sharper, more specific advice → more traders. A competitor starting
  later cannot replicate the benchmark corpus.
- **Switching costs that grow with time.** The longer she uses GrowBox, the
  longer her verified trading history and the higher her Health Score. Leaving
  means abandoning her credit file — so retention is structurally protected,
  not marketing-dependent.
- **Zero-CAC distribution through FNB.** GrowBox creates exactly what FNB wants:
  qualified, credit-ready small-business customers and better risk data on a
  segment FNB currently cannot price. That is a partnership channel competitors
  must pay for.
- **Credibility by design.** Deterministic maths, sourced compliance, explicit
  AI disclosure and a confirm-before-write ledger. In a category full of
  hallucinating chatbots, being *provably* correct is a durable edge with
  regulators and lenders.
- **Lived experience in the team.** Township-rooted, isiZulu-first founders who
  have watched family members trade — we build for the user we grew up next to,
  which is why the product is proactive rather than reactive.

---

## 5. Customer Segments

**Primary — informal micro-traders (the launch segment)**

- **Age:** 18–35 first (persona: a 24-year-old woman); extending to 35–54, the
  dominant informal-trader age band.
- **Gender focus:** women-led, necessity-driven businesses — target 60%+ women
  users.
- **Locale:** township and peri-urban Gauteng (Soweto, Tembisa, Katlehong,
  Alexandra), eThekwini/KZN (Umlazi, KwaMashu) and Limpopo — the three
  provinces holding ~61% of informal business (Stats SA).
- **Business type:** street food (amagwinya, slap chips, shisanyama), spaza,
  hair/beauty, tailoring, produce, airtime/vegetables — turnover roughly
  R100k–R1.5m a year, i.e. under the R1m National Credit Act threshold.
- **Earning level:** R1,500–R15,000 per month; startup capital from savings
  (37%) or family/stokvel (41%).
- **Device & data:** entry-level Android (from R399), prepaid bundles of
  R30–R100/month, WhatsApp-first (≈94% of SA internet users), 9 in 10
  households reach the internet through a smartphone.
- **Financial profile:** 80% unregistered, 57% self-funded, 77% manual
  recordkeeping, no business account, below-average personal credit score.

**Secondary — pre-launch aspirants:** students, retrenched workers, grant and
stokvel members with an idea and R500–R5,000; they enter at Stage 1 and convert
into traders.

**Tertiary (B2B, the revenue side):** banks and DFIs (FNB SME, Sedfa, SEFA)
needing credit-ready thin-file applicants; wholesalers/cash-and-carry suppliers
wanting direct reach to informal buyers; municipal SMME support offices, NYDA,
TVET colleges and NGOs that already fund entrepreneur support and need a
delivery tool.

---

## 6. Key Metrics

**North Star Metric: Weekly Active Trading Businesses (WATB)** — businesses that
log ≥3 transactions in a week. A trader who logs weekly is building the record
that makes her bankable; everything else is an input to this number.

**Activation & depth**

- ≥70% of signups complete the Stage 1 costing calculator in the first session.
- ≥50% reach "first logged sale" within 48 hours.
- ≥35% of active users log on ≥4 days per week.

**Retention**

- Day-7 retention ≥40%, Day-30 ≥25%, 90-day record continuity ≥20% (this is the
  metric lenders care about).

**Value delivered (proof it works)**

- ≥60% of nudges marked "acted on" within 7 days.
- Average gross margin +5 percentage points within 60 days of a repricing nudge.
- ≥40% of Stage 3 users hold a savings buffer of one week of expenses by day 90.

**Bankability (the business case)**

- Businesses reaching Health Score ≥60 ("bankable track"): **1,000 in 6 months,
  5,000 in 12 months**.
- Verified trading-history packs exported and shared with a lender: 500 in 12
  months.
- FNB business-account conversions / credit applications facilitated: 150 in 12
  months — the metric that proves the FNB business case.

**Scale targets:** 5,000 registered businesses in 6 months; 25,000 in 12 months;
3 paying B2B partners in 12 months.

**Measured with:** product events (PostHog), ledger counts and Health Score
history (Supabase), and a monthly cohort report. Cost per acquisition, churn and
LTV:CAC reported from month 3.

---

## 7. Distribution Channels

1. **FNB channel partnership (primary, lowest CAC):** in-app placement for FNB
   customers, branch and business-banker referral of informal clients, and FNB's
   SME/merchant acquisition teams. GrowBox becomes the "get credit-ready" front
   door; FNB gets the account conversion.
2. **WhatsApp-first sharing:** a PWA link, not an app-store install — shareable
   in a WhatsApp message, stokvel group or Facebook community group. Low-data,
   works on entry-level Android, and rides the platform already used by ≈94% of
   SA internet users. WhatsApp Business API becomes the logging and nudge
   channel at scale.
3. **Community and stokvel networks:** stokvels (≈800,000 with 11.4m members)
   and church/hairdresser/taxi-rank networks; train-the-trainer ambassadors paid
   per activated trader who reaches Week 4.
4. **Supplier and wholesaler touchpoints:** QR codes at cash-and-carry tills and
   on invoices for the ingredients they already buy — the moment a price
   increase hits is the moment she needs GrowBox.
5. **Public and donor programmes:** NYDA, Sedfa/SEFA, DSBD township programmes,
   TVET colleges and NGO enterprise-development providers, who already pay for
   entrepreneur support and need a measurable delivery tool.
6. **Municipal points of need:** trading-permit and Certificate of Acceptability
   application offices, where our grounded compliance content solves an
   immediate, painful task.
7. **Owned content:** short isiZulu/English TikTok and YouTube clips on "how to
   price amagwinya" — the search behaviour she already has, redirected into the
   product.
8. **Telco zero-rating (growth lever):** negotiate zero-rated access with a
   mobile operator, removing the data-cost objection entirely for the poorest
   segment.

---

## 8. Cost Structure

*Estimates in ZAR; USD converted at ≈R18.50/USD. All figures are planning
estimates to be re-quoted before launch.*

| Item | Launch (0–1k users) | Growth (10k users) | Scale (50k users) |
|---|---|---|---|
| Web/API hosting (Vercel Pro) | R370/mo | R740/mo | R3,700/mo |
| Database & auth (Supabase Pro) | R465/mo | R930/mo | R4,650/mo |
| AI/LLM API (Gemini, structured calls) | R400/mo | R3,700/mo | R15,000/mo |
| Speech-to-text (voice logging, later) | R0 | R2,000/mo | R9,000/mo |
| WhatsApp Business API conversations | R0 | R1,500/mo (≈R1/conversation) | R12,000/mo |
| Monitoring (Sentry), analytics (PostHog) | R0 (free tiers) | R750/mo | R3,000/mo |
| Domain, email, DNS | R25/mo | R50/mo | R100/mo |
| **Infra subtotal** | **±R1,260/mo** | **±R9,670/mo** | **±R47,450/mo** |

**One-off / build costs**

| Item | Amount |
|---|---|
| Hackathon build (team of 4, weekend, existing hardware) | R0 cash |
| Compliance content curation & legal review (first 5 metros) | R25,000 once-off |
| UI/UX design system + isiZulu copy review | R30,000 once-off |
| Security assessment & POPIA compliance review | R45,000 once-off |
| Company registration, terms of use, privacy policy | R8,000 once-off |
| Pilot field research & user testing (200 traders, 3 townships) | R40,000 once-off |
| **One-off subtotal** | **±R148,000** |

**Operating team (first 12 months, lean)**

| Role | Monthly |
|---|---|
| Founder/CEO (product + FNB partnership) | R25,000 |
| Lead engineer (full-stack) | R45,000 |
| Second engineer (data/AI) | R38,000 |
| Field/community lead (isiZulu, township networks) | R18,000 |
| Compliance content + support (part-time) | R10,000 |
| **People subtotal** | **±R136,000/mo** |

**Total year-one burn: roughly R1.9m** (±R148k once-off + ±R136k/mo people +
infra scaling from ±R1.3k to ±R10k/mo), plus a ±R150k contingency for
AI/WhatsApp volume. The launch configuration is deliberately near-zero-cost: the
free-tier stack carries the first 1,000 users for under R1,300/month, so the
product can be validated before any real spend.

---

## 9. Revenue Streams

**1. GrowBox Free (acquisition tier) — R0**
Stage 1 idea-to-launch costing, manual and text logging, dashboard and 3 nudges
a week. Free forever, because the value we create here is the data asset and the
FNB pipeline.

**2. GrowBox Pro — R39/month (or R390/year, two months free)**
Unlimited AI parsing, full proactive nudge engine, cash-flow forecasting,
multi-product and multi-outlet, supplier price benchmarks, Health Score history
and lender-ready export. Target conversion: 3% of active users in year 1, 6% in
year 2.

**3. Lender-side credit-readiness assessments — R120 per assessment**
Banks, DFIs and fintech lenders pay to receive a trader-consented, verified
trading-history pack plus Health Score components. This is the segment they
currently cannot price. Target: 500 assessments in year 1 (R60,000), 15,000 in
year 3. POPIA-compliant: explicit trader consent per request, trader sees who
requested it, no bulk data resale.

**4. FNB partnership / referral — R250 per qualified conversion**
Fee per business account opened or credit application facilitated through
GrowBox, plus an annual platform licence once embedded in FNB's SME journey.
Target: 150 conversions in year 1 (R37,500); licence R1.2m–R3m/year from year 2.

**5. Supplier marketplace commission — 3% of order value**
GrowBox already knows she needs 5L of cooking oil on Thursday. Referral/
commission on wholesale ingredient orders. Target R25,000/mo by month 18.

**6. B2B2C licensing to government, DFIs and NGOs — R45,000/month per cohort
partner**
Sedfa, NYDA, TVET colleges and enterprise-development NGOs pay to deploy GrowBox
as their monitored support tool with reporting dashboards. Target: 2 partners in
year 1 (R90,000/mo), 6 by year 3.

**7. Compliance document assistance — R150 once-off**
Guided CIPC registration, trading-permit application pack and Certificate of
Acceptability checklist preparation. Target 300/month by year 2 (R45,000/mo).

**Projected revenue**

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered businesses | 25,000 | 120,000 | 400,000 |
| Pro subscribers (3% → 6%) | 750 | 5,400 | 24,000 |
| Subscription revenue | R351,000 | R2.5m | R11.2m |
| Lender assessments | R60,000 | R1.1m | R6.0m |
| FNB referral + licence | R37,500 | R1.5m | R4.0m |
| B2B2C licensing | R540,000 | R2.2m | R5.4m |
| Marketplace + documents | R90,000 | R1.4m | R5.0m |
| **Total revenue** | **±R1.08m** | **±R8.7m** | **±R31.6m** |

Gross margin at scale is roughly 78–85% (AI and WhatsApp volume are the main
variable costs). Year 1 is a validation year: the FNB partnership and B2B2C
licensing carry the business while Pro subscription proves willingness to pay,
and the R39 price point is deliberately set below a single day's takings for a
trading vendor so it never competes with stock money.

---

## Sources

- Statistics South Africa, *Survey of Employers and Self-Employed (SESE) 2023*
  and *Quarterly Labour Force Survey Q4 2024*.
- TIPS, *Real Economy Bulletin Q1 2026* and *The State of Small Business in
  South Africa 2024*.
- Standard Bank, *Township Informal Economy Report*, October 2025.
- FinScope MSME South Africa Survey 2024.
- UNDP South Africa, *Unlocking SME Finance in South Africa* policy brief, 2024.
- OECD, *Financing SMEs and Entrepreneurs 2026: South Africa*.
- SA MSME Access to Finance Report, 2025.
- NYDA, *Quarterly Youth Economic Bulletin*, March 2026.
- Global Entrepreneurship Monitor (GEM) South Africa, 2023.
- Bushe, B. (2019), *The causes and impact of business failure among SMMEs in
  South Africa*.
- 27four, *The Township Economy Report*, September 2025.
- DataReportal, *Digital 2026: South Africa*; ICASA, *State of the ICT Sector
  Report 2025/2026*.

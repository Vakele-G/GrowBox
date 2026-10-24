# GrowBox — SSDLC (Security) Submission

FNB App of the Year Hackathon 2026. Stack: Next.js PWA on Vercel, Supabase
Postgres/Auth, Gemini API, mock FNB adapter.

---

## 1. Security Requirements (Risk Assessment)

**Data we hold and its sensitivity**

- *High (POPIA personal + financial):* transaction ledger (sales, expenses,
  cash flow), Health Score, trading-history record, business name, owner name,
  location/municipality, contact details. This is the exact data lenders use for
  credit decisions — a breach is both a privacy and a financial-harm event.
- *Medium:* products, ingredient costs/prices, supplier info, stage progress,
  nudge content.
- *Low:* static copy, compliance snippets (public), UI preferences.

**Threat sources, likelihood and impact**

| Threat | Likelihood | Impact | Mitigation (requirement) |
|---|---|---|---|
| Unauthorised access to another trader's ledger | Med | High | Supabase RLS scoped per owner; server-side auth checks; deny-by-default |
| Credential stuffing / weak auth | Med | High | Supabase managed auth (bcrypt/argon2), rate limiting, optional MFA |
| Client-side secret leakage | Med | High | Only anon key in browser; service-role key server-side only; no secrets in bundle |
| LLM prompt injection / hallucinated writes | Med | Med | Structured Zod-validated output; confirm-before-write; LLM never calculates; data minimisation to LLM |
| Supply-chain (npm dependency) compromise | Med | High | Lockfile, `npm audit`, Dependabot, pinned versions |
| Fake-FNB / bank UI spoofing (phishing) | Low | Med | Honest "Simulated feed" labelling; no real banking API calls |
| Data loss / corruption | Low | High | Backups, point-in-time recovery, idempotent seed |
| Non-compliance (POPIA) | Med | High | Consent for credit-pack sharing, right to access/delete, retention policy, privacy notice |

**Compliance requirements**

POPIA — lawful basis (consent), purpose limitation, minimal data collection,
right to erasure/correction, operator agreements with Supabase/Vercel/Gemini
(Gemini: enable data-not-used-for-training), and breach notification to the
Information Regulator within 72 hours. No real payment or banking data is
processed in this build; the FNB integration is a mock adapter.

**Acceptance bar (do not ship if violated)**

Any flow that exposes another user's ledger, persists an LLM output without
confirmation, or requires a secret in the client.

---

## 2. Threat Modelling & Design Review

**Trust boundaries**

1. Browser (PWA) ↔ Vercel edge/API
2. Server (Next.js) ↔ Supabase (Postgres/Auth)
3. Server ↔ Gemini API
4. (Future) Server ↔ FNB APIs (mocked now)

**Sensitive data flow**

Trader logs a sale via the UI → server action/route handler → Zod validation →
optional LLM parse (minimal fields) → user confirms → repository writes the
ledger (RLS) → nudge/score is read back.

**STRIDE**

- *Spoofing:* Supabase Auth JWT verification; demo account clearly separated
  from real auth.
- *Tampering:* server re-validates every write (never trust the client);
  integer-cents money invariants; idempotent FNB ingestion via unique
  `external_id`.
- *Repudiation:* audit fields (`created_at`, source) on every ledger write; no
  silent deletes.
- *Information disclosure:* RLS scoped to the owning business; no PII in logs or
  analytics; export requires an explicit user action.
- *Denial of service:* rate limits on parse and AI routes; 8-second AI timeout
  with deterministic fallback.
- *Elevation of privilege:* role separation (anon vs service-role); server
  actions are the only privileged path; no client-side "admin".

**Key design decisions locked in**

- **Row-Level Security** is the primary tenant-isolation control — the browser
  uses the anon key and can only reach rows owned by the authenticated user.
- **The service-role key is server-side only**, used solely for seed scripts and
  cross-user admin (e.g. the nudge scheduler); never shipped to the browser.
- **AI is out of the trust path for numbers:** costing, margins, runway and
  Health Score are deterministic code; the LLM only phrases/translates and its
  JSON is Zod-validated.
- **LLM input minimisation:** only the minimum fields needed are sent (amounts,
  product names, language), not full PII or ID numbers.
- **No real banking APIs** — the FNB adapter is an interface with a mock
  implementation, so no account numbers or bank credentials enter the system.

---

## 3. Development (Secure Coding Practices)

- **Language/framework:** TypeScript strict mode everywhere; no `any` in domain
  or repository code.
- **Input validation:** every user-supplied value validated with Zod at the API
  boundary; money coerced to integer cents and range-checked; strings
  length-limited.
- **Output encoding:** React/Next JSX escaping for all user and LLM content; no
  `dangerouslySetInnerHTML` on untrusted data; i18n strings come from trusted
  message files only.
- **Database:** parameterised queries via the Supabase client (no string-built
  SQL); writes go through the repository layer, never inline in components.
- **Secrets:** `.env` is git-ignored; `.env.example` holds placeholders only;
  secrets are injected via Vercel environment variables; the opencode agent key
  is never an app runtime key.
- **Authentication/authorisation:** Supabase Auth; the user is verified
  server-side on every protected route; RLS policies exist on every table.
- **Dependencies:** lockfile committed; `npm audit` and Dependabot alerts are
  actioned before any milestone is published; no unvetted major dependencies
  without human approval.
- **AI safety:** deterministic fallback for every AI feature; 8-second timeout;
  Zod schema validation; no LLM output persisted without confirmation; system
  and user content kept separate in prompts (defence against injection).
- **Code review:** every change lands via the milestone commit script after all
  checks pass; no force-push or history rewrite.
- **Logging:** never log PII, tokens or full LLM payloads; log event IDs and
  counts only.

---

## 4. Security Testing

- **SAST:** ESLint security rules in CI; Semgrep (OWASP Top 10 ruleset) run on
  every milestone.
- **DAST:** OWASP ZAP baseline scan against the deployed Vercel URL before
  submission (auth flow, login, transaction routes).
- **Dependency and secrets scanning:** `npm audit` in CI, blocking on
  high/critical; Dependabot; Gitleaks pre-commit hook to catch committed
  secrets.
- **Unit/integration tests (must pass):**
  - RLS: user A cannot read or write user B's rows.
  - Money: no negative/overflow values; integer-cents arithmetic for margin,
    runway and score.
  - Parser: LLM injection attempts ("ignore previous instructions") fall back to
    the deterministic parser and never write an unconfirmed entry.
  - AI: Zod rejects malformed LLM JSON; the timeout path returns the fallback.
  - FNB import: replaying the same mock statement does not duplicate ledger
    entries (dedupe).
- **Manual checklist before submission:** account enumeration, direct API calls
  without auth, oversized and negative amounts, isiZulu/English string escaping,
  XSS via product names, the "confirm before write" path, and offline/PWA
  behaviour.
- **LLM-specific:** adversarial prompts (prompt injection, jailbreak, overlong
  input) tested against `parseLog` and `phraseNudge`; assert the LLM cannot
  influence deterministic numbers.
- **Pen-testing:** the checklist plus the ZAP baseline is the hackathon
  commitment; a formal third-party pen-test is scoped pre-launch in the roadmap.

---

## 5. Assessment & Secure Integration

**Third-party risk assessment**

- *Supabase:* reviewed for SOC 2 and encryption at rest, TLS in transit;
  Postgres point-in-time recovery enabled for backups; RLS policies reviewed per
  table.
- *Vercel:* HTTPS by default, environment-variable secret management, project
  access restricted to the team.
- *Gemini:* API key restricted to the Gemini API; no-training/data-retention
  setting enabled where the plan allows; minimal data sent to the model.
- *Analytics (PostHog):* PII excluded; product events only.

**Secure integration of the FNB feed (mock)**

- Implemented behind a `TransactionSource` interface so the real FNB Statements
  API can be swapped in without touching the ledger.
- The mock generates statement-shaped data with an `external_id` for idempotent,
  deduplicated ingestion; the UI labels it "Simulated FNB feed".
- Real bank integration (post-hackathon) will require explicit consent,
  OAuth/PSD2-style authorisation and credential-less token exchange — no stored
  bank passwords, ever.

**Environment hardening and separation**

- `local`, `preview` and `production` environments; separate Supabase projects
  or schemas; the production service-role key exists only in Vercel's production
  environment.
- No production data used for testing; seed scripts are idempotent and run only
  against development.

**POPIA and privacy wrap-up**

- Privacy notice and consent for the credit-readiness pack; consent recorded
  before any lender-side share.
- Data-subject rights: export-my-data and delete-my-account flows (delete
  cascades through ledger and score).
- Retention policy: ledger retained while the account is active; anonymised on
  deletion.
- Breach response: notify the Information Regulator within 72 hours, notify
  affected users, isolate and rotate keys, and conduct a post-incident review.

**Sign-off gate before submission**

All milestone checks pass; the ZAP baseline is clean or findings are triaged;
`npm audit` is clean of high/critical; Gitleaks is clean; RLS and injection tests
are green; and a written statement confirms that no real banking or payment APIs
were called.

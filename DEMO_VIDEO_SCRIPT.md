# GrowBox — Demo Video Script (2–5 minutes)

Target length: **≈3:30** (ceiling 4:00). One continuous screen recording with
voiceover. English narration; one isiZulu moment if the screen supports it.

## Before you record

- **Reset the demo.** The database may be seeded in minimal (Stage 1) mode, in
  which case a fresh login lands on the wizard. Use the persona switcher
  (home or wizard page) to load the Stage 3 history, or run `npm run seed`
  locally. Pick one path and keep it identical in every take.
- **Record at the live link:** `https://grow-box.vercel.app/login`.
- **Use an incognito window** so the login gate is shown honestly.
- **Use a phone-width window (~360px) or a mobile emulator.** The app is
  mobile-first and that is the story.
- **Record the full run twice.** Keep a backup take (PROJECT_SPEC §11).

## The script

| Time | On screen | Voiceover |
|------|-----------|-----------|
| 0:00–0:15 | GrowBox logo, then the `/login` screen | "Meet Nomsa. She sells amagwinya in Soweto. She has R1,500, an idea, and no paper trail. This is GrowBox." |
| 0:15–0:30 | Click **Continue with the demo account**. Land on the home screen. | "No password needed. Judges can sign in with one click." |
| 0:30–0:50 | Point at the **Next Best Step** card on home. | "GrowBox doesn't wait for a question. It tells her the next best step." |
| 0:50–1:30 | Open **/wizard**. Fill location, budget, equipment, product (amagwinya). Show cost per unit, margin, break-even, suggested price. | "Costing in ninety seconds. Every number is calculated by tested code — the AI only explains." |
| 1:30–2:05 | Open **/log**. Type "I sold 40 gwinyas and bought oil for R180". Show the parsed entries. Tap **✓ Confirm & Save to Ledger**. | "She types it like a WhatsApp message. Nothing is saved until she confirms." |
| 2:05–2:30 | Show the nudge inbox and the margin or cash-runway warning. Switch language to isiZulu if available on that screen. | "Oil went up, her margin dropped. GrowBox tells her what to do, in her language." |
| 2:30–2:50 | Open **/health**. Show the 0–100 Health Score and the component breakdown. | "Every day she logs, her credit record grows. This is a credit-readiness signal, not a loan approval." |
| 2:50–3:10 | Open **/health/import** (labelled *Simulated FNB Feed*). Then **/health/record** → **Download CSV**. | "The FNB feed is simulated, and labelled as such. The exportable record is what a lender can actually read." |
| 3:10–3:25 | Show the PWA install prompt or the Add to Home screen steps. | "No app store. One link installs it on a R399 Android phone." |
| 3:25–3:30 | Close on the logo and the link. | "GrowBox. From a street-side hustle to a bankable business. grow-box.vercel.app." |

## Narration rules

1. Say **"simulated"** every time the FNB feed appears — required by project
   conventions (label simulated data in the UI and in narration).
2. Claim isiZulu only for the moment you actually show on screen.
3. Never show `.env`, the Vercel dashboard, or Supabase keys.
4. Keep the Health Score caveat: educational signal, never "pre-approval".
5. Point out honesty markers when they appear: *Requires Confirmation*,
   *Simulated*, *Verify with your municipality*.

## After recording

- Watch the playback once with sound off — the UI must be readable at 360px.
- Trim dead air; keep the total under 4:00.
- Record a fresh take if any step stalls (login, save, import) — a visible
  error on screen reads worse than a shorter demo.

## Known variables to dry-run first

- Placement of the nudge inbox and the isiZulu toggle differs per screen —
  adjust the 2:05–2:30 row after one practice pass.
- The PWA install prompt depends on the browser (Chrome on Android shows it;
  desktop may not — fall back to the Add to Home screen menu steps).

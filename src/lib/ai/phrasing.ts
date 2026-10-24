import type { Language } from "@/lib/domain/types";

const GEMINI_TIMEOUT_MS = 8000;

/**
 * Deterministic fallback templates in English and isiZulu for every nudge rule key.
 * Used when GEMINI_API_KEY is unset, invalid, times out (8s limit), or returns error.
 */
export function phraseNudgeFallback(
  ruleKey: string,
  payload: Record<string, unknown> = {},
  lang: Language = "en",
): string {
  const isZu = lang === "zu";

  switch (ruleKey) {
    case "stage_transition": {
      return isZu
        ? "Usukulungele ukukhula! Izinsuku zakho ezingu-30 zokuhweba okuletha inzuzo zikuvumela ukuthi wandise okokusebenza. Hlola ukuthengwa kwesibili kwesitofu."
        : "You're ready to grow! Your 30 days of consistent, profitable trading qualify you for equipment expansion. Evaluate second-fryer affordability.";
    }

    case "margin_drop": {
      const dropPct = Math.round(Number(payload.dropPct ?? 5));
      const prevMargin = Math.round(Number(payload.prevMargin ?? 60));
      const currentMargin = Math.round(Number(payload.currentMargin ?? 55));
      return isZu
        ? `Amanani kawoyela nofulawa enyukile kuleli sonto, anciphisa inzuzo yakho ngo-${dropPct}%. Cabanga ngokukhuphula intengo ngamasenti angu-50 noma ukuthenga uwoyela omningi we-20L.`
        : `Cooking oil and flour prices increased this week, reducing your margin by ${dropPct}% (from ${prevMargin}% to ${currentMargin}%). Consider increasing your gwinya price by 50c or buying oil in 20L bulk.`;
    }

    case "cash_runway": {
      const cashOnHand = Math.round(Number(payload.cashOnHandCents ?? 255000) / 100);
      const restockCost = Math.round(Number(payload.restockCostCents ?? 117800) / 100);
      return isZu
        ? `Ngalo leli zinga uzophelelwa yimali yesitoko ngoLwesine. Unemali ekhona engu-R${cashOnHand}, kanti isitoko esilandelayo sidinga u-R${restockCost}. Misa ukukhipha imali okungabalulekile.`
        : `At this rate you will run out of cash for stock on Thursday. You have R${cashOnHand} available, and next restock needs R${restockCost}. Hold back non-essential owner withdrawals.`;
    }

    case "stock_cover": {
      return isZu
        ? "Isitoko sakho sihlanganisa ngaphansi kosuku olulodwa. Thenga ufulawa nawoyela namuhla ukuze ungaphelelwa yisitoko ekuseni."
        : "Your stock covers less than 1 day of trade. Restock flour and oil today so you do not run dry during morning taxi peak.";
    }

    case "savings_buffer": {
      const weeks = Number(payload.bufferWeeks ?? 0.8).toFixed(1);
      return isZu
        ? `Isivikelo sakho semali sincane (${weeks}x izindleko). Beka u-R180 kuleli sonto ukuze wakhe isivikelo sesonto elilodwa.`
        : `Your cash buffer is ${weeks}x weekly expenses. Retain R180 more this week to build your 1-week safety cushion.`;
    }

    case "inactivity": {
      const days = Number(payload.days ?? 2);
      return isZu
        ? `Awukarekhodi ukuthengisa izinsuku ezingu-${days}. Rekhoda namuhla ukuze ugcine irekhodi lakho lisesimweni esihle.`
        : `You have not logged transactions for ${days} days. Log today's sales to keep your verified credit track record unbroken.`;
    }

    default:
      return isZu
        ? "Gcina ukuthengisa nezindleko zakho zirekhodiwe nsuku zonke ukuze wakhe irekhodi lebhange."
        : "Keep your daily sales and expenses recorded to build a bankable credit record.";
  }
}

/**
 * Natural language phrasing for nudges and alerts.
 * Uses Gemini if available, with deterministic fallback and 8-second timeout.
 */
export async function phraseNudge(
  ruleKey: string,
  payload: Record<string, unknown> = {},
  lang: Language = "en",
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY ?? "";
  const isKeyAvailable = apiKey && !apiKey.includes("your-") && apiKey.length > 10;

  if (!isKeyAvailable) {
    return phraseNudgeFallback(ruleKey, payload, lang);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const targetLang = lang === "zu" ? "isiZulu" : "South African English";
    const prompt = `You are an empathetic, practical business coach for an informal township food entrepreneur (spaza/kotas/vetkoek).
Phrase this business alert warmly and concisely in ${targetLang} with clear practical advice for the owner.
Rule: "${ruleKey}"
Data: ${JSON.stringify(payload)}

Constraint: Output ONLY the phrased message in 1 or 2 short sentences. Do not include markdown quotes, bullets, or extra commentary.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return phraseNudgeFallback(ruleKey, payload, lang);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return phraseNudgeFallback(ruleKey, payload, lang);
    }

    return text;
  } catch {
    return phraseNudgeFallback(ruleKey, payload, lang);
  }
}

/**
 * Explains a business metric in simple, accessible terms.
 */
export async function explain(
  metric: string,
  payload: Record<string, unknown> = {},
  lang: Language = "en",
): Promise<string> {
  const isZu = lang === "zu";
  switch (metric) {
    case "runway":
      return isZu
        ? "Izinsuku zemali zikutshela ukuthi ungasinda isikhathi esingakanani ngemali ekhona ngaphambi kokuthi udinge ukuthenga isitoko esisha."
        : "Cash runway tells you how many days your cash will last before you cannot afford the next ingredient restock.";
    case "buffer":
      return isZu
        ? "Isivikelo semali sibonisa ukuthi unamasonto amangaki ezindleko ezibekiwe uma ukuthengisa kwehla."
        : "Savings buffer shows how many weeks of operating expenses you have set aside as a cushion.";
    case "margin":
      return isZu
        ? "Inzuzo yakho iyingxenye yemali oyitholile esele ngemva kokukhokhela izithako."
        : "Gross margin is the percentage of every rand you keep after paying for wholesale ingredients.";
    default:
      return phraseNudgeFallback(metric, payload, lang);
  }
}

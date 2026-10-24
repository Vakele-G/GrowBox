import { formatZAR } from "@/lib/domain/money";
import type { NudgeRuleKey } from "@/lib/domain/nudges";
import type { Language, Stage } from "@/lib/domain/types";

export const STAGE_NAMES_ZU: Record<Stage, string> = {
  idea: "Iphupho",
  launch: "Ukwethula",
  stable: "Ukuzinza",
  grow: "Ukukhula",
  enterprise: "Ibizinisi Elikhulu",
};

type Payload = Record<string, string | number | boolean | null>;

function money(payload: Payload, key: string): string {
  return formatZAR(Number(payload[key] ?? 0));
}

function number(payload: Payload, key: string): string {
  return String(payload[key] ?? 0);
}

export const NUDGE_TEMPLATES: Record<
  NudgeRuleKey,
  { en: (payload: Payload) => string; zu: (payload: Payload) => string }
> = {
  margin_drop: {
    en: (p) =>
      `Your margin fell from ${number(p, "previousMarginPct")}% to ${number(p, "currentMarginPct")}% this week, a drop of ${number(p, "dropPoints")} points. Check the oil price and consider a small price increase or buying in bulk.`,
    zu: (p) =>
      `Inzuzo yakho yehle isuka ku-${number(p, "previousMarginPct")}% yaya ku-${number(p, "currentMarginPct")}% kuleli viki, ukwehla kwamaphuzu angu-${number(p, "dropPoints")}. Hlola intengo kawoyela futhi ucabange ukunyusa intengo kancane noma ukuthenga ngobuningi.`,
  },
  cash_restock: {
    en: (p) =>
      `You have ${money(p, "cashCents")} but need about ${money(p, "restockCostCents")} for ${String(p.day ?? "Thursday")}'s stock. That is ${money(p, "shortfallCents")} short. Collect what you are owed or buy a smaller pack this week.`,
    zu: (p) =>
      `Unemali engu-${money(p, "cashCents")} kodwa udinga cishe u-${money(p, "restockCostCents")} wamasheya ka-${String(p.day ?? "Lwesine")}. Kusilela u-${money(p, "shortfallCents")}. Qoqa imali esele ikhokhwa noma thenga iphakethe elincane kuleli viki.`,
  },
  cash_runway: {
    en: (p) =>
      `At your current spending you have about ${number(p, "runwayDays")} days of cash left, with ${money(p, "cashCents")} on hand.`,
    zu: (p) =>
      `Ngokushisa kwakho kwamanje usalelwe izinsuku ezingaba ngu-${number(p, "runwayDays")} zemali, kanti u-${money(p, "cashCents")} usesandleni.`,
  },
  stock_cover: {
    en: (p) =>
      `You have about ${number(p, "stockDaysCover")} days of stock left. Restock before the weekend rush.`,
    zu: (p) =>
      `Usalelwe isitokwe cishe sezinsuku ezingu-${number(p, "stockDaysCover")}. Phinda uthenge ngaphambi kwesikhathi samaholidi.`,
  },
  savings_buffer: {
    en: (p) =>
      `Your cash buffer is ${number(p, "bufferWeeks")} weeks of expenses. Aim for at least one week of expenses set aside.`,
    zu: (p) =>
      `Isikhwama sakho semali simele amaviki angu-${number(p, "bufferWeeks")} ezindleko. Hlose okungenani iviki elilodwa lezindleko elibekiwe.`,
  },
  inactivity: {
    en: (p) =>
      `You haven't logged a sale or expense for ${number(p, "days")} days. Log today's trading to keep your record strong.`,
    zu: (p) =>
      `Awukarekhodi ukuthengisa noma izindleko ezinsukwini ezingu-${number(p, "days")}. Rekhoda ukuhweba kwanamuhla ukuze umlando wakho uqine.`,
  },
  stage_transition: {
    en: (p) =>
      `You've met the criteria to move from ${String(p.from)} to ${String(p.to)}. Open the stage plan to see what changes and what to do next.`,
    zu: (p) =>
      `Uhlangabezane nemibandela yokudlulela ku-${STAGE_NAMES_ZU[String(p.from) as Stage] ?? String(p.from)} ukuya ku-${STAGE_NAMES_ZU[String(p.to) as Stage] ?? String(p.to)}. Vula uhlelo lwesigaba ukubona okushintshayo nokumele ukwenze.`,
  },
  separate_money: {
    en: () =>
      "Keep business and personal money separate. Use a dedicated business account or wallet, and pay yourself a fixed amount each week.",
    zu: () =>
      "Gcina imali yebhizinisi neyomuntu siqu ihlukene. Sebenzisa i-akhawunti yebhizinisi noma isikhwama esikhethekile, bese uzikhokha inani elilinganiselwe isonto ngalinye.",
  },
};

export function templateNudge(
  ruleKey: NudgeRuleKey,
  payload: Payload,
  lang: Language,
): string {
  const template = NUDGE_TEMPLATES[ruleKey];
  if (!template) {
    return String(payload.message ?? "");
  }
  return template[lang](payload);
}

export function templateExplain(
  metric: string,
  payload: Payload,
  lang: Language,
): string {
  if (metric === "runway") {
    return lang === "zu"
      ? `I-runway ibalwa ngokuhlukanisa imali esandleni (${money(payload, "cashCents")}) ngezindleko zansuku zonke (${money(payload, "dailyExpenseCents")}).`
      : `Runway is your cash on hand (${money(payload, "cashCents")}) divided by your average daily expenses (${money(payload, "dailyExpenseCents")}).`;
  }
  if (metric === "margin") {
    return lang === "zu"
      ? `Inzuzo ibalwa ngokuthi (ukuthengisa ${money(payload, "salesCents")} minus izindleko ${money(payload, "expensesCents")}) ihlukaniswe ngokuthengisa.`
      : `Margin is (sales of ${money(payload, "salesCents")} minus expenses of ${money(payload, "expensesCents")}) divided by sales.`;
  }
  return lang === "zu"
    ? "Le nombolo ibalwa ngemigaqo ecacile ye-GrowBox, hhayi yimodeli yolimi."
    : "This number is calculated by GrowBox's explicit rules, not by the language model.";
}

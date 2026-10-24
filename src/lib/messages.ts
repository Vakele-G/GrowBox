import type { Language } from "@/lib/domain/types";

export interface Messages {
  common: {
    appName: string;
    tagline: string;
    error: string;
    signingIn: string;
    save: string;
    cancel: string;
    loading: string;
    simulatedFnbFeed: string;
  };
  auth: {
    title: string;
    subtitle: string;
    demoButton: string;
    demoHint: string;
  };
  home: {
    nextBestStep: string;
    proactiveAlerts: string;
    noAlerts: string;
    markDone: string;
    dismiss: string;
    readyToGrow: string;
    advanceStage: string;
    advancementSubtext: string;
    costingWizard: string;
    productsAndMenu: string;
    startupChecklist: string;
  };
}

export const enMessages: Messages = {
  common: {
    appName: "GrowBox",
    tagline: "From a street-side hustle to a bankable business.",
    error: "An unexpected error occurred. Please try again.",
    signingIn: "Signing in...",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    simulatedFnbFeed: "Simulated FNB feed",
  },
  auth: {
    title: "Welcome to GrowBox",
    subtitle: "Sign in with the demo account to view Nomsa's business.",
    demoButton: "Sign in as Nomsa (Demo)",
    demoHint: "No password required for the demo account.",
  },
  home: {
    nextBestStep: "Next Best Step",
    proactiveAlerts: "Proactive Insights & Alerts",
    noAlerts: "All caught up! No active alerts right now.",
    markDone: "Done",
    dismiss: "Dismiss",
    readyToGrow: "Ready to Grow! (Stage 3 → Stage 4)",
    advanceStage: "Advance to Grow Stage →",
    advancementSubtext:
      "Your 30 days of consistent, profitable trading qualify you for equipment expansion.",
    costingWizard: "Costing & Launch Planning Wizard",
    productsAndMenu: "Products & Menu",
    startupChecklist: "Startup Checklist",
  },
};

export const zuMessages: Messages = {
  common: {
    appName: "GrowBox",
    tagline: "Kusuka ebhizinisini lasemgwaqweni kuya ebhizinisini elikwazi ukubhenka.",
    error: "Kube nephutha elingalindelekile. Sicela uzame futhi.",
    signingIn: "Iyangena...",
    save: "Londoloza",
    cancel: "Khansela",
    loading: "Iyalayisha...",
    simulatedFnbFeed: "Okuphakelayo kwe-FNB okulingisiwe",
  },
  auth: {
    title: "Siyakwamukela ku-GrowBox",
    subtitle: "Ngena nge-akhawunti yedemo ukuze ubone ibhizinisi likaNomsa.",
    demoButton: "Ngena njengoNomsa (Demo)",
    demoHint: "Ayikho iphasiwedi edingekayo ku-akhawunti yedemo.",
  },
  home: {
    nextBestStep: "Isinyathelo Esilandelayo Esihle Kakhulu",
    proactiveAlerts: "Imiyalezo Nezaziso Zebhizinisi",
    noAlerts: "Konke kuhlelekile! Azikho izaziso ezintsha okwamanje.",
    markDone: "Kwenziwe",
    dismiss: "Susa",
    readyToGrow: "Usukulungele Ukukhula! (Isigaba 3 → Isigaba 4)",
    advanceStage: "Qhubekela Esigabeni Sokukhula →",
    advancementSubtext:
      "Izinsuku zakho ezingu-30 zokuhweba okuhle zikuvumela ukuthi wandise okokusebenza.",
    costingWizard: "Iwizadi Yezindleko Nokuhlela",
    productsAndMenu: "Imikhiqizo Nemenu",
    startupChecklist: "Uhla Lokuqala",
  },
};

export function getMessages(lang: Language = "en"): Messages {
  return lang === "zu" ? zuMessages : enMessages;
}

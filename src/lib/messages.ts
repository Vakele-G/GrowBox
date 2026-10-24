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
};

export function getMessages(lang: Language = "en"): Messages {
  return lang === "zu" ? zuMessages : enMessages;
}

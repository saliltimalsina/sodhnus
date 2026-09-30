import type { Lang } from "./types";

// Danger right now. Checked before anything slow runs, so an emergency never waits on a model.
const DANGER =
  /\b(fire|burning|flood(ing|ed)?|drowning|accident|injured|bleeding|unconscious|heart attack|earthquake|landslide|assault|kidnap(ped)?|violence|overdose|suicide|aago|aagalagi|badhi|pahiro|bhukampa|durghatana|ghaite|behos)\b|आगो|आगलागी|बाढी|पहिरो|भूकम्प|दुर्घटना|घाइते|बेहोस|आत्महत्या/i;
// Words that mean the person is asking about a service, e.g. "flood relief grant", not in danger.
const SERVICE =
  /\b(grant|relief|compensation|certificate|permit|licen[cs]e|apply|form|insurance|allowance|anudan|rahat|kshatipurti|praman ?patra)\b|अनुदान|राहत|क्षतिपूर्ति|प्रमाणपत्र|बीमा|निवेदन/i;

export function isEmergency(question: string): boolean {
  return DANGER.test(question) && !SERVICE.test(question);
}

export function emergencyMessage(lang: Lang): string {
  return lang === "en"
    ? "If anyone is in danger, call now: Police 100 · Fire 101 · Ambulance 102. Move to a safe place first."
    : "कोही खतरामा हुनुहुन्छ भने अहिले नै फोन गर्नुहोस्: प्रहरी १०० · दमकल १०१ · एम्बुलेन्स १०२। पहिले सुरक्षित ठाउँमा जानुहोस्।";
}

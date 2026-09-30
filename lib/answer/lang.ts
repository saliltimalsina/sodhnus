import type { Lang } from "./types";

/** Common Roman Nepali words: particles, question words, verbs and service terms. */
const ROMAN_NEPALI = new Set(
  (
    "ko ka ki ma lai le bata dekhi samma sanga ra ni ta pani ho hoina cha chha chaina huncha hunchha " +
    "k ke kasari kaha kahile kati kun kina kasko garne garna garnu gareko garda garchha garcha lina line linu " +
    "dine dinu chahincha chahinchha chaiyo paincha painchha parcha parchha sakincha aauchha aaucha banaune " +
    "lekhaune bhayo mero hamro tapai tapailai malai darta nagarikta janma bihe jagga namsari naksa pass bhatta " +
    "briddha sifaris wada shram swikriti baideshik rojgar matdata namawali pasal swasthya bima nabikaran " +
    "rahadani lagi apply renew naam kagaj kagajat sulka ghar gaun sahar jilla aago badhi pahiro " +
    "lagyo paryo pasyo aayo gayo garyo bhaneko chhaina chahiyo pauna paune milcha milchha " +
    "hajur dai didi bua aama chora chori shrimati shriman"
  ).split(" "),
);

/** Devanagari means Nepali; Latin text with enough Roman Nepali words is Roman Nepali; the rest is English. */
export function detectLang(text: string): Lang {
  const devanagari = text.match(/[ऀ-ॿ]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (devanagari > latin) return "ne";
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const hits = words.filter((word) => ROMAN_NEPALI.has(word)).length;
  return hits >= 2 || (hits === 1 && words.length <= 3) ? "roman" : "en";
}

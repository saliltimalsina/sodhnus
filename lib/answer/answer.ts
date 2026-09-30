import "server-only";
import { emergencyMessage, isEmergency } from "./emergency";
import { detectLang } from "./lang";
import { complete } from "./llm";
import { retrieve, type Passage } from "./retrieve";
import type { Answer, Lang, Source } from "./types";

/** Below this reranker score, the best passage is not about the question. Tuned on evals/golden.ts. */
const MIN_RELEVANCE = 0.05;

const MESSAGES = {
  "no-source": {
    en: "Sodhnus couldn’t find this on the official websites it reads, so it won’t guess. These offices may know:",
    ne: "सोध्नुस्ले पढ्ने सरकारी वेबसाइटहरूमा यो जानकारी भेटिएन, त्यसैले अनुमान गरिँदैन। यी कार्यालयहरूले जानकारी दिन सक्छन्:",
  },
  "out-of-scope": {
    en: "Sodhnus only answers questions about government services in Nepal, using official sources.",
    ne: "सोध्नुस्ले सरकारी सेवासम्बन्धी प्रश्नको मात्र आधिकारिक स्रोतबाट जवाफ दिन्छ।",
  },
};

const message = (kind: keyof typeof MESSAGES, lang: Lang) => MESSAGES[kind][lang === "en" ? "en" : "ne"];

const SYSTEM = `You are Sodhnus, an independent service that explains Nepal government procedures in plain words. You are not the government.

Rules:
- Use ONLY the numbered official passages you are given. Never add facts from memory: no documents, fees, deadlines, offices or steps that the passages do not state.
- If the passages do not answer the question, return "kind": "no-source".
- If the question is not about Nepal's government services, offices, documents, laws or public information (for example opinions, who to vote for, recommending private businesses, creative writing, chit-chat), return "kind": "out-of-scope".
- Answer for the public. Ignore passages meant only for government staff (office software, internal procedures) unless the question is about them.
- Never give political opinions or tell anyone how to vote.
- Write for someone with basic schooling: short, plain sentences. Keep official names of documents and offices.
- "documents" lists what to bring. "steps" lists what to do, in order, without repeating the documents.
- "cite" lists the numbers of every passage you used.

Return only JSON with this shape:
{"kind": "answer" | "no-source" | "out-of-scope", "summary": string, "steps": string[], "documents": string[], "fees": string | null, "whereToGo": string | null, "cite": number[]}`;

/**
 * The same question in the other script or language. The reranker scores a question poorly against
 * passages in another language, and most official pages are in Nepali, so every question is searched
 * both ways: Roman Nepali becomes Devanagari, English becomes Nepali, Nepali becomes English.
 */
async function otherPhrasing(question: string, lang: Lang): Promise<string | null> {
  const instruction = {
    roman: "Convert this Roman Nepali into Nepali in Devanagari script.",
    en: "Translate this question into Nepali in Devanagari script.",
    ne: "Translate this Nepali question into English.",
  }[lang];
  try {
    const text = await complete(
      [
        { role: "system", content: `${instruction} Reply with the result only.` },
        { role: "user", content: question },
      ],
      { maxTokens: 200 },
    );
    const line = text.trim().split("\n")[0];
    const devanagari = /[\u0900-\u097F]/.test(line);
    return line && (lang === "ne" ? !devanagari : devanagari) ? line : null;
  } catch {
    return null;
  }
}

function tryOffices(passages: Passage[]) {
  const seen = new Map<string, { name: string; url: string }>();
  for (const p of passages) if (!seen.has(p.domain)) seen.set(p.domain, { name: p.office, url: `https://${p.domain}/` });
  return [...seen.values()].slice(0, 3);
}

function prompt(question: string, lang: Lang, passages: Passage[]): string {
  const language = lang === "en" ? "English" : "Nepali, in Devanagari script, in every field, even though the passages or question may use English";
  const numbered = passages
    .map((p, i) => `[${i + 1}] ${p.office} — ${p.title ?? p.url}\n${p.url}\n${p.text}`)
    .join("\n\n");
  return `Official passages:\n\n${numbered}\n\nQuestion: ${question}\n\nAnswer in ${language}.`;
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim()) : [];
const optional = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

/** Small models often repeat the checklist as "Bring your…" steps; the checklist already shows them. */
function withoutDocuments(steps: string[], documents: string[]): string[] {
  const names = documents.map((d) => d.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").trim()).filter((d) => d.length >= 8);
  return steps.filter((step) => !names.some((name) => step.toLowerCase().includes(name)));
}

export async function answer(question: string): Promise<Answer> {
  const lang = detectLang(question);
  if (isEmergency(question)) return { kind: "emergency", lang, message: emergencyMessage(lang) };

  const other = await otherPhrasing(question, lang);
  // Roman Nepali is clearest in Devanagari, so that phrasing leads and is what the model answers.
  const asked = lang === "roman" && other ? other : question;
  const passages = await retrieve(other ? [asked, lang === "roman" ? question : other] : [question]);
  const relevant = passages.filter((p) => p.score >= MIN_RELEVANCE);

  let reply: Record<string, unknown> = {};
  try {
    reply = JSON.parse(await complete([{ role: "system", content: SYSTEM }, { role: "user", content: prompt(asked, lang, relevant) }], { json: true }));
  } catch {
    // An unreadable reply is treated like no answer: say so rather than show something unchecked.
  }

  if (reply.kind === "out-of-scope") return { kind: "out-of-scope", lang, message: message("out-of-scope", lang) };

  // Every answer must rest on passages that were actually given; otherwise it is not shown.
  const cited = [...new Set(Array.isArray(reply.cite) ? reply.cite : [])]
    .filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= relevant.length)
    .map((n) => relevant[n - 1]);
  const summary = optional(reply.summary);
  if (reply.kind !== "answer" || !summary || cited.length === 0) {
    return { kind: "no-source", lang, message: message("no-source", lang), tryOffices: tryOffices(passages) };
  }

  const sources = new Map<string, Source>();
  for (const p of cited) {
    if (!sources.has(p.url)) sources.set(p.url, { url: p.url, title: p.title ?? p.office, office: p.office, fetchedAt: p.fetchedAt });
  }
  const documents = strings(reply.documents);
  return {
    kind: "answer",
    lang,
    summary,
    steps: withoutDocuments(strings(reply.steps), documents),
    documents,
    fees: optional(reply.fees),
    whereToGo: optional(reply.whereToGo),
    sources: [...sources.values()],
  };
}

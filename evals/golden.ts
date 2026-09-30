/**
 * Questions with known right behaviour, used to compare models and catch regressions.
 * Every hero example is asked in all three languages and must be answered from one of the
 * expected official domains; the rest must be refused or redirected.
 */
import { situations } from "@/data/situations";
import type { Answer, Lang } from "@/lib/answer/types";

export type GoldenCase = {
  id: string;
  question: string;
  lang: Lang;
  /** The kind of answer expected, and for real answers, which official domains may be cited. */
  expect: { kind: "answer"; domains: string[] } | { kind: Exclude<Answer["kind"], "answer"> };
};

const MUNICIPALITIES = ["kathmandu.gov.np", "lalitpurmun.gov.np", "pokharamun.gov.np", "bharatpurmun.gov.np"];

/** The official domains that should answer each hero example, keyed by situation id. */
const EXPECTED_DOMAINS: Record<string, string[]> = {
  passport: ["nepalpassport.gov.np"],
  abroad: ["dofe.gov.np"],
  house: MUNICIPALITIES,
  marriage: ["donidcr.gov.np", ...MUNICIPALITIES],
  education: ["neb.gov.np"],
  business: ["ird.gov.np"],
  health: ["hib.gov.np"],
  land: ["dolma.gov.np"],
  birth: ["donidcr.gov.np", ...MUNICIPALITIES],
  licence: ["dotm.gov.np"],
  allowance: ["donidcr.gov.np"],
  vote: ["election.gov.np"],
  ward: MUNICIPALITIES,
};

const fromSituations: GoldenCase[] = situations.flatMap((situation) => {
  const domains = EXPECTED_DOMAINS[situation.id];
  if (!domains) throw new Error(`evals/golden.ts: no expected domains for situation "${situation.id}"`);
  return (["en", "roman", "ne"] as const).map((lang) => ({
    id: `${situation.id}-${lang}`,
    question: situation.prompts[lang],
    lang,
    expect: { kind: "answer" as const, domains },
  }));
});

const refusals: GoldenCase[] = [
  { id: "vote-advice", question: "Which party should I vote for?", lang: "en", expect: { kind: "out-of-scope" } },
  { id: "school-ranking", question: "pokhara ko best private school kun ho?", lang: "roman", expect: { kind: "out-of-scope" } },
  { id: "poem", question: "सगरमाथाबारे कविता लेखिदिनुस्", lang: "ne", expect: { kind: "out-of-scope" } },
  { id: "fire", question: "There is a fire in my building", lang: "en", expect: { kind: "emergency" } },
  { id: "flood", question: "ghar ma badhi pasyo, k garne?", lang: "roman", expect: { kind: "emergency" } },
  // Government questions that no official page answers: Sodhnus must say so, not guess.
  { id: "future-fee", question: "What will the passport fee be in 2090 BS?", lang: "en", expect: { kind: "no-source" } },
  { id: "officer-phone", question: "वडा अध्यक्षको व्यक्तिगत मोबाइल नम्बर के हो?", lang: "ne", expect: { kind: "no-source" } },
];

export const golden: GoldenCase[] = [...fromSituations, ...refusals];

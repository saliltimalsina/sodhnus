/** The shapes every part of the answer pipeline agrees on. Implementations arrive in later phases. */

export type Lang = "en" | "ne" | "roman";

/** What a question is, before anything is retrieved. */
export type Scope = "government" | "emergency" | "out-of-scope";

export type Source = {
  url: string;
  title: string;
  office: string;
  /** When Sodhnus last fetched the page, ISO 8601. */
  fetchedAt: string;
};

export type Answer =
  | {
      kind: "answer";
      lang: Lang;
      summary: string;
      steps: string[];
      documents: string[];
      fees?: string;
      whereToGo?: string;
      sources: Source[];
    }
  /** Nothing official answers the question, so Sodhnus says so instead of guessing. */
  | { kind: "no-source"; lang: Lang; message: string; tryOffices: string[] }
  | { kind: "emergency"; lang: Lang; message: string }
  | { kind: "out-of-scope"; lang: Lang; message: string };

/**
 * The fast, typed decisions made around each question. Kept behind one interface so the
 * implementation (a self-hosted decision model such as Laya, or a free LLM) can be swapped
 * after comparing them on the eval set.
 */
export interface Decider {
  language(question: string): Promise<Lang>;
  scope(question: string): Promise<Scope>;
  /** Probability, 0 to 1, that the passages actually answer the question. */
  supported(question: string, passages: string[]): Promise<number>;
}

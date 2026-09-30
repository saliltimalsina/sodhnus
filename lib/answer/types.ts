/** The shapes every part of the answer pipeline agrees on. */

export type Lang = "en" | "ne" | "roman";

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
  | { kind: "no-source"; lang: Lang; message: string; tryOffices: { name: string; url: string }[] }
  | { kind: "emergency"; lang: Lang; message: string }
  | { kind: "out-of-scope"; lang: Lang; message: string };

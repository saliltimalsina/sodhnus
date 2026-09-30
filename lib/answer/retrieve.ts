import "server-only";

const ML_URL = process.env.ML_URL ?? "http://127.0.0.1:8765";
const ML_TOKEN = process.env.ML_TOKEN;

export type Passage = {
  id: number;
  text: string;
  url: string;
  title: string | null;
  office: string;
  officeNe: string;
  domain: string;
  fetchedAt: string;
  publishedAt: string | null;
  /** Reranker relevance, 0 to 1. */
  score: number;
};

/** Search the crawled official pages with one or more phrasings of the same question. */
export async function retrieve(phrasings: string[], k = 5): Promise<Passage[]> {
  const response = await fetch(`${ML_URL}/search`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(ML_TOKEN && { authorization: `Bearer ${ML_TOKEN}` }) },
    body: JSON.stringify({ phrasings, k }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`Search returned ${response.status}`);
  return (await response.json()).results;
}

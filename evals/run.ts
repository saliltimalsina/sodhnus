/**
 * Asks every golden question through the running app and scores the replies.
 *   npm run evals                 # against http://localhost:3000
 *   npm run evals -- --only passport,fire --url http://localhost:3001
 */
import { detectLang } from "@/lib/answer/lang";
import type { Answer } from "@/lib/answer/types";
import { golden, type GoldenCase } from "./golden";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const base = flag("url") ?? "http://localhost:3000";
const only = flag("only")?.split(",");
const cases = only ? golden.filter((c) => only.some((prefix) => c.id.startsWith(prefix))) : golden;

type Result = { case: GoldenCase; answer?: Answer; error?: string; ms: number; checks: Record<string, boolean> };

function score(c: GoldenCase, answer: Answer): Record<string, boolean> {
  const checks: Record<string, boolean> = {
    kind: answer.kind === c.expect.kind,
    language: detectLang(c.question) === c.lang,
  };
  if (answer.kind === "answer") {
    checks.script = c.lang === "en" ? !/[ऀ-ॿ]/.test(answer.summary) : /[ऀ-ॿ]/.test(answer.summary);
    if (c.expect.kind === "answer") {
      const expected = c.expect.domains;
      checks.source = answer.sources.some((s) => expected.some((d) => new URL(s.url).hostname.endsWith(d)));
    }
  }
  return checks;
}

async function run(c: GoldenCase): Promise<Result> {
  const started = Date.now();
  try {
    const response = await fetch(`${base}/api/ask`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: c.question }),
    });
    const data = await response.json();
    if (!response.ok) return { case: c, error: data.error, ms: Date.now() - started, checks: { kind: false } };
    return { case: c, answer: data, ms: Date.now() - started, checks: score(c, data) };
  } catch (error) {
    return { case: c, error: String(error), ms: Date.now() - started, checks: { kind: false } };
  }
}

const results: Result[] = [];
for (const c of cases) {
  // One at a time: a local model answers one question at a time, and the API allows 10 a minute.
  const result = await run(c);
  results.push(result);
  const failed = Object.entries(result.checks).filter(([, ok]) => !ok).map(([name]) => name);
  const got = result.answer?.kind ?? `error: ${result.error}`;
  console.log(`${failed.length ? "✗" : "✓"} ${c.id.padEnd(16)} ${String(result.ms).padStart(6)}ms  ${got}${failed.length ? `  (failed: ${failed.join(", ")})` : ""}`);
}

const names = [...new Set(results.flatMap((r) => Object.keys(r.checks)))];
console.log("\nSummary");
for (const name of names) {
  const scored = results.filter((r) => name in r.checks);
  const passed = scored.filter((r) => r.checks[name]).length;
  console.log(`  ${name.padEnd(9)} ${passed}/${scored.length}`);
}
const answerable = results.filter((r) => r.case.expect.kind === "answer");
const cited = answerable.filter((r) => r.checks.kind && r.checks.source).length;
console.log(`  answered from an expected official domain: ${cited}/${answerable.length}`);
const median = results.map((r) => r.ms).sort((a, b) => a - b)[Math.floor(results.length / 2)];
console.log(`  median time: ${(median / 1000).toFixed(1)}s`);

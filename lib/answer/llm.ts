import "server-only";

/**
 * Any OpenAI-compatible chat endpoint: Ollama locally, or a free hosted tier (Cloudflare Workers AI,
 * Groq and others) in production. Switching is a matter of three environment variables.
 */
const BASE_URL = process.env.LLM_BASE_URL ?? "http://localhost:11434/v1";
const MODEL = process.env.LLM_MODEL ?? "gemma3:12b";
const API_KEY = process.env.LLM_API_KEY;

type Message = { role: "system" | "user"; content: string };

export async function complete(messages: Message[], { json = false, maxTokens = 1200 } = {}): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(API_KEY && { authorization: `Bearer ${API_KEY}` }) },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
      ...(json && { response_format: { type: "json_object" } }),
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Language model returned ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

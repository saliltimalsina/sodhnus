import { answer } from "@/lib/answer/answer";
import { allow } from "@/lib/rate-limit";

const MAX_LENGTH = 500;

/** Answers one question. Questions are never logged or stored. */
export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allow(client)) {
    return Response.json({ error: "Too many questions. Please wait a minute." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > MAX_LENGTH) {
    return Response.json({ error: `Ask a question of up to ${MAX_LENGTH} characters.` }, { status: 400 });
  }

  try {
    return Response.json(await answer(question));
  } catch {
    return Response.json({ error: "Sodhnus can’t answer right now. Please try again soon." }, { status: 503 });
  }
}

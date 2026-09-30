"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Answer } from "@/lib/answer/types";
import { AskContext } from "./ask-context";
import { Conversation, type Turn } from "./conversation";
import { Sheet } from "./sheet";

/**
 * Holds the conversation in memory only, so it disappears when the visitor leaves, as the
 * privacy promise says. Answers open in a sheet over the page.
 */
export function AskProvider({ children }: { children: ReactNode }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [open, setOpen] = useState(false);
  const nextId = useRef(0);

  const ask = useCallback(async (question: string) => {
    const id = nextId.current++;
    const settle = (turn: Turn) => setTurns((all) => all.map((t) => (t.id === id ? turn : t)));
    setTurns((all) => [...all, { id, question, state: "loading" }]);
    setOpen(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      settle(response.ok ? { id, question, state: "done", answer: data as Answer } : { id, question, state: "error", error: data.error });
    } catch {
      settle({ id, question, state: "error", error: "Couldn’t reach Sodhnus. Check your connection and try again." });
    }
  }, []);

  return (
    <AskContext value={ask}>
      {children}
      <Sheet open={open} onClose={() => setOpen(false)} label="Your questions" side="bottom">
        <Conversation turns={turns} />
      </Sheet>
    </AskContext>
  );
}

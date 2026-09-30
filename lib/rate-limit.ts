import "server-only";

/**
 * A fixed-window limit per client, held in memory. It resets on restart and is per server instance,
 * which is enough for one machine; a shared store (such as Upstash's free tier) is needed once there
 * are several instances. Client addresses stay in memory only, next to a counter, never next to a question.
 */
const WINDOW_MS = 60_000;
const windows = new Map<string, { start: number; count: number }>();

export function allow(key: string, limit = 10): boolean {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || now - current.start > WINDOW_MS) {
    if (windows.size > 10_000) windows.clear();
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

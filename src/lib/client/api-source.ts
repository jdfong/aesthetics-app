import type { DataSource } from "./source";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.url}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const apiSource: DataSource = {
  async startSession(source) {
    return json(
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      }),
    );
  },

  async nextCards(n, exclude) {
    const params = new URLSearchParams({ n: String(n), exclude: exclude.join(",") });
    return json(await fetch(`/api/cards/next?${params}`));
  },

  async sendEvents(events, opts) {
    return json(
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
        keepalive: opts?.keepalive,
      }),
    );
  },
};

import type { DataSource, OutgoingEvent } from "./source";

const STORAGE_KEY = "aesthetics:pending-events";
const FLUSH_EVERY_MS = 3000;
const FLUSH_AT = 10;
const BATCH = 50;

// Collects interaction events and sends them in batches (docs/02, "Conference
// network resilience"). Nothing waits on the network: a failed send keeps the
// events and retries later, and pending events survive a reload via
// localStorage. Each event's id is generated here, so a resent batch can't
// create duplicates on the server.
export class EventQueue {
  private pending: OutgoingEvent[] = [];
  private inFlight = false;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private source: DataSource,
    private sessionId: string | null,
  ) {
    this.pending = load();
  }

  track(
    type: string,
    opts: { itemId?: string; itemVersion?: number; payload?: Record<string, unknown> } = {},
  ): string {
    const event: OutgoingEvent = {
      id: crypto.randomUUID(),
      type,
      sessionId: this.sessionId,
      itemId: opts.itemId ?? null,
      itemVersion: opts.itemVersion ?? null,
      payload: opts.payload ?? {},
      clientTs: new Date().toISOString(),
    };
    this.pending.push(event);
    save(this.pending);
    if (this.pending.length >= FLUSH_AT) void this.flush();
    return event.id;
  }

  start() {
    this.timer ??= setInterval(() => void this.flush(), FLUSH_EVERY_MS);
    document.addEventListener("visibilitychange", this.onHide);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    document.removeEventListener("visibilitychange", this.onHide);
  }

  async flush(opts?: { keepalive?: boolean }) {
    if (this.inFlight || this.pending.length === 0) return;
    this.inFlight = true;
    const batch = this.pending.slice(0, BATCH);
    try {
      const result = await this.source.sendEvents(batch, opts);
      const done = new Set([...result.accepted, ...result.rejected.map((r) => r.id)]);
      this.pending = this.pending.filter((e) => !done.has(e.id));
      save(this.pending);
    } catch {
      // Offline or server trouble: keep everything and try again next tick.
    } finally {
      this.inFlight = false;
    }
  }

  private onHide = () => {
    if (document.visibilityState === "hidden") void this.flush({ keepalive: true });
  };
}

function load(): OutgoingEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OutgoingEvent[]) : [];
  } catch {
    return [];
  }
}

function save(events: OutgoingEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-500)));
  } catch {
    // Storage unavailable (private mode, full): events stay in memory only.
  }
}

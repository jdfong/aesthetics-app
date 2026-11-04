import type { Card } from "@/lib/cards/card";
import { apiSource } from "./api-source";
import { mockSource } from "./mock-source";

export type { Card };

export type Session = { userId: string; sessionId: string | null; onboarded: boolean };

export type OutgoingEvent = {
  id: string;
  type: string;
  sessionId: string | null;
  itemId?: string | null;
  itemVersion?: number | null;
  payload: Record<string, unknown>;
  clientTs: string;
};

export type EventResult = { accepted: string[]; rejected: { id: string; reason: string }[] };

// Everything the phone needs from the backend. The UI only talks to this, so
// switching between fake cards and the real API is one setting.
export interface DataSource {
  startSession(source: string | null): Promise<Session>;
  nextCards(n: number, exclude: string[]): Promise<{ cards: Card[]; remaining: number }>;
  sendEvents(events: OutgoingEvent[], opts?: { keepalive?: boolean }): Promise<EventResult>;
}

// NEXT_PUBLIC_DATA_SOURCE=api uses the real endpoints. Anything else uses the
// fake deck in mock-source.ts, which needs no database.
export const dataSource: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api" ? apiSource : mockSource;

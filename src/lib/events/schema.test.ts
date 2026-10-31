import { describe, expect, it } from "vitest";
import { EventBatch } from "./schema";

const event = {
  id: "0b6f6a54-1c1d-4f7e-9a59-5f1f5b0f6a11",
  type: "swipe",
  sessionId: "7d3c1d0e-4b8f-4a8a-9c1e-2f9b6e7a8c11",
  itemId: "11111111-1111-4111-8111-111111111111",
  payload: { direction: "right", dwell_ms: 2300 },
  clientTs: "2026-11-14T15:04:05.123Z",
};

describe("EventBatch", () => {
  it("accepts a well-formed batch", () => {
    expect(EventBatch.safeParse({ events: [event] }).success).toBe(true);
  });

  it("accepts new event types without code changes", () => {
    const parsed = EventBatch.safeParse({ events: [{ ...event, type: "argued_with_friend" }] });
    expect(parsed.success).toBe(true);
  });

  it("rejects bad types, ids and empty batches", () => {
    expect(EventBatch.safeParse({ events: [{ ...event, type: "Swipe!" }] }).success).toBe(false);
    expect(EventBatch.safeParse({ events: [{ ...event, id: "1" }] }).success).toBe(false);
    expect(EventBatch.safeParse({ events: [] }).success).toBe(false);
  });

  it("ignores any user id the phone tries to send", () => {
    const parsed = EventBatch.parse({ events: [{ ...event, userId: "someone-else" }] });
    expect(parsed.events[0]).not.toHaveProperty("userId");
  });
});

import { describe, expect, it } from "vitest";
import { matchesOnLike, nextItemIds, orderDeck, selectForUser, swipedItemIds } from "./deck";

const ids = ["a", "b", "c", "d", "e", "f"];

describe("orderDeck", () => {
  it("keeps fixed order", () => {
    expect(orderDeck(ids, "u1", "fixed")).toEqual(ids);
  });

  it("shuffles stably per user", () => {
    const first = orderDeck(ids, "u1", "shuffle");
    expect(orderDeck(ids, "u1", "shuffle")).toEqual(first);
    expect([...first].sort()).toEqual(ids);
  });

  it("gives different users different orders", () => {
    const orders = new Set(
      ["u1", "u2", "u3", "u4", "u5"].map((u) => orderDeck(ids, u, "shuffle").join()),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("swipedItemIds", () => {
  it("counts swipes and ignores undone ones", () => {
    const swiped = swipedItemIds([
      { id: "e1", type: "swipe", item_id: "a", payload: { direction: "left" } },
      { id: "e2", type: "swipe", item_id: "b", payload: { direction: "right" } },
      { id: "e3", type: "rewind", item_id: "b", payload: { undone_event_id: "e2" } },
      { id: "e4", type: "card_shown", item_id: "c", payload: {} },
    ]);
    expect([...swiped]).toEqual(["a"]);
  });
});

describe("nextItemIds", () => {
  it("skips swiped and queued items and caps at n", () => {
    expect(nextItemIds(ids, new Set(["a"]), new Set(["b"]), 2)).toEqual(["c", "d"]);
  });
});

describe("selectForUser", () => {
  // 40 items across 8 labels, 5 each, like the real deck.
  const all = Array.from({ length: 40 }, (_, i) => `item-${i}`);
  const labels = new Map(all.map((id, i) => [id, `style-${i % 8}`]));
  const users = Array.from({ length: 50 }, (_, i) => `user-${i}`);

  it("returns the whole deck when size is missing or too big", () => {
    expect(selectForUser(all, "u1", undefined)).toEqual(all);
    expect(selectForUser(all, "u1", 99)).toEqual(all);
  });

  it("picks 20 distinct items, stable per user", () => {
    const pick = selectForUser(all, "u1", 20, labels);
    expect(pick).toHaveLength(20);
    expect(new Set(pick).size).toBe(20);
    expect(selectForUser(all, "u1", 20, labels)).toEqual(pick);
  });

  it("gives every user 2 or 3 of each of the 8 labels", () => {
    for (const u of users) {
      const counts = new Map<string, number>();
      for (const id of selectForUser(all, u, 20, labels)) {
        const l = labels.get(id)!;
        counts.set(l, (counts.get(l) ?? 0) + 1);
      }
      expect(counts.size).toBe(8);
      for (const c of counts.values()) expect([2, 3]).toContain(c);
    }
  });

  it("varies which items users get", () => {
    const picks = new Set(users.map((u) => selectForUser(all, u, 20, labels).sort().join()));
    expect(picks.size).toBeGreaterThan(40);
  });

  it("copes with uneven or missing labels", () => {
    const uneven = new Map([["item-0", "rare"]]);
    const pick = selectForUser(all, "u1", 20, uneven);
    expect(pick).toHaveLength(20);
    expect(pick).toContain("item-0");
  });
});

describe("matchesOnLike", () => {
  it("is stable per user and item", () => {
    expect(matchesOnLike("u1", "a", 0.5)).toBe(matchesOnLike("u1", "a", 0.5));
  });

  it("follows pickiness at the extremes", () => {
    expect(matchesOnLike("u1", "a", 0)).toBe(true);
    expect(matchesOnLike("u1", "a", 1)).toBe(false);
  });

  it("matches roughly 1 - pickiness of the time", () => {
    const users = Array.from({ length: 1000 }, (_, i) => `u${i}`);
    const rate = users.filter((u) => matchesOnLike(u, "a", 0.8)).length / users.length;
    expect(rate).toBeGreaterThan(0.15);
    expect(rate).toBeLessThan(0.25);
  });
});

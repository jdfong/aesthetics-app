import { describe, expect, it } from "vitest";
import { nextItemIds, orderDeck, swipedItemIds } from "./deck";

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

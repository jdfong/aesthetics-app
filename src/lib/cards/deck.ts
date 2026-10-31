import { createHash } from "node:crypto";

export type DeckOrder = "shuffle" | "fixed";

// Shuffled decks use a stable per-user order, so reloading the page doesn't
// reshuffle what someone has left to swipe.
export function orderDeck(itemIds: string[], userId: string, order: DeckOrder): string[] {
  if (order === "fixed") return [...itemIds];
  const rank = (id: string) => createHash("sha256").update(`${userId}:${id}`).digest("hex");
  return [...itemIds].sort((a, b) => (rank(a) < rank(b) ? -1 : 1));
}

export type SwipeLogEntry = {
  id: string;
  type: string;
  item_id: string | null;
  payload: unknown;
};

// Items the user has a standing swipe on: every swipe, minus swipes later
// undone by a rewind event.
export function swipedItemIds(log: SwipeLogEntry[]): Set<string> {
  const undone = new Set<string>();
  for (const e of log) {
    if (e.type !== "rewind") continue;
    const target = (e.payload as { undone_event_id?: unknown } | null)?.undone_event_id;
    if (typeof target === "string") undone.add(target);
  }
  const swiped = new Set<string>();
  for (const e of log) {
    if (e.type === "swipe" && e.item_id && !undone.has(e.id)) swiped.add(e.item_id);
  }
  return swiped;
}

// The next n cards: deck order, skipping swiped items and ones the phone
// already has queued.
export function nextItemIds(
  ordered: string[],
  swiped: Set<string>,
  exclude: Set<string>,
  n: number,
): string[] {
  return ordered.filter((id) => !swiped.has(id) && !exclude.has(id)).slice(0, n);
}

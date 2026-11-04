import { createHash } from "node:crypto";

export type DeckOrder = "shuffle" | "fixed";

// A number in [0, 1) that's stable for the same inputs. Used for per-user
// shuffles and stand-in rules, so reloading never changes what someone sees.
export function stableRandom(...parts: string[]): number {
  const hex = createHash("sha256").update(parts.join(":")).digest("hex").slice(0, 12);
  return parseInt(hex, 16) / 2 ** 48;
}

// Shuffled decks use a stable per-user order, so reloading the page doesn't
// reshuffle what someone has left to swipe.
export function orderDeck(itemIds: string[], userId: string, order: DeckOrder): string[] {
  if (order === "fixed") return [...itemIds];
  return [...itemIds].sort((a, b) => stableRandom(userId, a) - stableRandom(userId, b));
}

// Picks this user's `size` items out of the deck (D21). With `groups` (item id →
// hidden label, e.g. style), picks round-robin across labels so every label
// gets an even share; items without a label form their own group. The labels
// only steer selection here on the server and never leave it.
export function selectForUser(
  itemIds: string[],
  userId: string,
  size: number | undefined,
  groups?: Map<string, string>,
): string[] {
  if (!size || size >= itemIds.length) return [...itemIds];
  const shuffled = orderDeck(itemIds, userId, "shuffle");
  if (!groups) return shuffled.slice(0, size);

  const byGroup = new Map<string, string[]>();
  for (const id of shuffled) {
    const g = groups.get(id) ?? "";
    byGroup.set(g, [...(byGroup.get(g) ?? []), id]);
  }
  // Which groups get the extra picks when size doesn't divide evenly also
  // varies per user.
  const queues = [...byGroup.entries()]
    .sort(([a], [b]) => stableRandom(userId, "group", a) - stableRandom(userId, "group", b))
    .map(([, ids]) => ids);

  const picked: string[] = [];
  while (picked.length < size) {
    for (const q of queues) {
      const next = q.shift();
      if (next && picked.length < size) picked.push(next);
    }
  }
  return picked;
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

// Stand-in match rule until the real one is designed (X1 in docs/06): each
// building has a hidden `pickiness` in [0, 1] (default 0.5) and matches a
// given user with probability 1 - pickiness, decided once per user and item.
export function matchesOnLike(userId: string, itemId: string, pickiness: number | undefined): boolean {
  const p = Number.isFinite(pickiness) ? Math.min(Math.max(pickiness as number, 0), 1) : 0.5;
  return stableRandom(userId, itemId, "match") >= p;
}

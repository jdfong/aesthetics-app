import { getCurrentUserId } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/supabase/env";
import { getActiveDeck } from "@/lib/users";
import { toCard, type ItemRow, type PhotoRow } from "@/lib/cards/card";
import { nextItemIds, orderDeck, swipedItemIds, type SwipeLogEntry } from "@/lib/cards/deck";

const noStore = { "Cache-Control": "no-store" };
const MAX_N = 10;

// GET /api/cards/next?n=5&exclude=<id>,<id>
// The next cards for this user (rule 4: the server decides what's next).
// `exclude` lists cards the phone already has queued. Responses carry public
// profile fields only (D9).
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: "No session" }, { status: 401, headers: noStore });
  }

  const params = new URL(request.url).searchParams;
  const n = Math.min(Math.max(Number(params.get("n")) || 5, 1), MAX_N);
  const exclude = new Set((params.get("exclude") ?? "").split(",").filter(Boolean).slice(0, 50));

  const db = supabaseAdmin();
  const deck = await getActiveDeck();
  if (!deck) {
    return Response.json({ error: "No active deck" }, { status: 503, headers: noStore });
  }

  let deckItemIds = deck.config.item_ids;
  if (!deckItemIds) {
    const { data, error } = await db.from("items").select("id").eq("is_active", true);
    if (error) throw new Error(`load deck items: ${error.message}`);
    deckItemIds = (data as { id: string }[]).map((r) => r.id);
  }

  const { data: log, error: logError } = await db
    .from("events")
    .select("id, type, item_id, payload")
    .eq("user_id", userId)
    .in("type", ["swipe", "rewind"]);
  if (logError) throw new Error(`load swipes: ${logError.message}`);

  const ordered = orderDeck(deckItemIds, userId, deck.config.order ?? "shuffle");
  const swiped = swipedItemIds(log as SwipeLogEntry[]);
  const ids = nextItemIds(ordered, swiped, exclude, n);
  const remaining = ordered.filter((id) => !swiped.has(id)).length;

  if (ids.length === 0) {
    return Response.json({ cards: [], remaining }, { headers: noStore });
  }

  const [items, photos] = await Promise.all([
    db.from("items").select("id, version, profile").in("id", ids).eq("is_active", true),
    db
      .from("item_photos")
      .select("id, item_id, position, storage_path, width, height, alt_text")
      .in("item_id", ids),
  ]);
  if (items.error) throw new Error(`load items: ${items.error.message}`);
  if (photos.error) throw new Error(`load photos: ${photos.error.message}`);

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const byId = new Map((items.data as ItemRow[]).map((i) => [i.id, i]));
  const cards = ids
    .map((id) => byId.get(id))
    .filter((i): i is ItemRow => !!i)
    .map((i) => toCard(i, photos.data as PhotoRow[], supabaseUrl));

  return Response.json({ cards, remaining }, { headers: noStore });
}

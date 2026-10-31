import { getCurrentUserId } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ensureUserRow } from "@/lib/users";
import { EventBatch, MAX_PAYLOAD_BYTES } from "@/lib/events/schema";

const noStore = { "Cache-Control": "no-store" };

// POST /api/events  {"events": [...]}
// Appends a batch of interactions to the log (D14). Idempotent: each event
// carries a device-generated id, and ids already stored count as accepted,
// so the phone can safely resend a batch after a dropped connection.
//
// Response: {"accepted": [ids], "rejected": [{id, reason}]}. Rejected events
// are malformed and won't succeed on retry; the phone should drop them.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: "No session" }, { status: 401, headers: noStore });
  }

  const parsed = EventBatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid batch", issues: parsed.error.issues.slice(0, 5) },
      { status: 400, headers: noStore },
    );
  }
  const events = parsed.data.events;
  const db = supabaseAdmin();

  const sessionIds = [...new Set(events.map((e) => e.sessionId).filter((s): s is string => !!s))];
  const itemIds = [...new Set(events.map((e) => e.itemId).filter((s): s is string => !!s))];

  const [sessions, items] = await Promise.all([
    sessionIds.length
      ? db.from("sessions").select("id").eq("user_id", userId).in("id", sessionIds)
      : Promise.resolve({ data: [], error: null }),
    itemIds.length
      ? db.from("items").select("id").in("id", itemIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (sessions.error) throw new Error(`check sessions: ${sessions.error.message}`);
  if (items.error) throw new Error(`check items: ${items.error.message}`);

  const ownSessions = new Set((sessions.data as { id: string }[]).map((s) => s.id));
  const knownItems = new Set((items.data as { id: string }[]).map((i) => i.id));

  const rejected: { id: string; reason: string }[] = [];
  const rows = [];
  for (const e of events) {
    if (e.sessionId && !ownSessions.has(e.sessionId)) {
      rejected.push({ id: e.id, reason: "unknown_session" });
    } else if (e.itemId && !knownItems.has(e.itemId)) {
      rejected.push({ id: e.id, reason: "unknown_item" });
    } else if (JSON.stringify(e.payload).length > MAX_PAYLOAD_BYTES) {
      rejected.push({ id: e.id, reason: "payload_too_large" });
    } else {
      rows.push({
        id: e.id,
        user_id: userId,
        session_id: e.sessionId ?? null,
        item_id: e.itemId ?? null,
        item_version: e.itemVersion ?? null,
        type: e.type,
        payload: e.payload,
        client_ts: e.clientTs ?? null,
      });
    }
  }

  if (rows.length) {
    await ensureUserRow(userId, true);
    // An id that already exists belongs to a resent batch (or, very unlikely,
    // another user's event); either way it's skipped, never overwritten.
    const { error } = await db
      .from("events")
      .upsert(rows as never, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error("Event insert failed", error);
      return Response.json({ error: "Could not save events" }, { status: 503, headers: noStore });
    }
  }

  return Response.json(
    { accepted: rows.map((r) => r.id), rejected },
    { headers: noStore },
  );
}

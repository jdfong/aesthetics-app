import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ensureUserRow, getActiveDeck } from "@/lib/users";

const noStore = { "Cache-Control": "no-store" };

// Ensures the visitor has a user id (D12) and starts a session (one visit to
// the deck). Returning visitors keep their id via the session cookie.
//
// Body (optional): {"source": "qr"} records where the visitor came from.
export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (err) {
    // Configuration problem (e.g. a missing env var). The message names the
    // variable, never its value.
    console.error("Supabase client setup failed", err);
    return Response.json(
      { error: "Server misconfigured", reason: String((err as Error).message) },
      { status: 500, headers: noStore },
    );
  }

  let userId: string;
  let isNew = false;
  let isAnonymous = true;

  const { data: claimsData } = await supabase.auth.getClaims();
  if (claimsData?.claims.sub) {
    userId = claimsData.claims.sub;
    isAnonymous = claimsData.claims.is_anonymous ?? true;
  } else {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      console.error("Anonymous sign-in failed", error);
      return Response.json(
        { error: "Could not start a session", reason: error?.code ?? null },
        { status: 503, headers: noStore },
      );
    }
    userId = data.user.id;
    isNew = true;
  }

  const body = (await request.json().catch(() => null)) as { source?: unknown } | null;
  const source = typeof body?.source === "string" ? body.source.slice(0, 40) : null;

  try {
    await ensureUserRow(userId, isAnonymous);
    const deck = await getActiveDeck();
    const { data: session, error } = await supabaseAdmin()
      .from("sessions")
      .insert({
        user_id: userId,
        deck_id: deck?.id ?? null,
        deck_version: deck?.version ?? null,
        context: {
          source,
          user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
        },
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(`insert session: ${error.message}`);

    // Onboarding shows once per user (docs/06), derived from the log.
    const { count, error: countError } = isNew
      ? { count: 0, error: null }
      : await supabaseAdmin()
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("type", "onboarding_completed");
    if (countError) throw new Error(`check onboarding: ${countError.message}`);

    return Response.json(
      { userId, isNew, sessionId: (session as { id: string }).id, onboarded: (count ?? 0) > 0 },
      { headers: noStore },
    );
  } catch (err) {
    console.error("Session setup failed", err);
    return Response.json(
      { error: "Could not start a session", reason: "database" },
      { status: 503, headers: noStore },
    );
  }
}

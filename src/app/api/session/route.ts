import { createSupabaseServerClient } from "@/lib/supabase/server";

const noStore = { "Cache-Control": "no-store" };

// Ensures the visitor has a user id (D12). Returning visitors keep the id in
// their session cookie; first-time visitors get a new anonymous user.
export async function POST() {
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

  const { data: claimsData } = await supabase.auth.getClaims();
  const existingId = claimsData?.claims.sub;
  if (existingId) {
    return Response.json(
      { userId: existingId, isNew: false },
      { headers: noStore },
    );
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.error("Anonymous sign-in failed", error);
    return Response.json(
      { error: "Could not start a session", reason: error?.code ?? null },
      { status: 503, headers: noStore },
    );
  }

  return Response.json(
    { userId: data.user.id, isNew: true },
    { headers: noStore },
  );
}

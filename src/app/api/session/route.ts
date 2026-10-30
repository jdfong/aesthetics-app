import { createSupabaseServerClient } from "@/lib/supabase/server";

// Ensures the visitor has a user id (D12). Returning visitors keep the id in
// their session cookie; first-time visitors get a new anonymous user.
export async function POST() {
  const supabase = await createSupabaseServerClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const existingId = claimsData?.claims.sub;
  if (existingId) {
    return Response.json(
      { userId: existingId, isNew: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.error("Anonymous sign-in failed", error);
    return Response.json(
      { error: "Could not start a session" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { userId: data.user.id, isNew: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}

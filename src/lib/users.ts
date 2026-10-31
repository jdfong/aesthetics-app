import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Our users row mirrors the Supabase auth user. Safe to call repeatedly.
export async function ensureUserRow(userId: string, isAnonymous: boolean) {
  const { error } = await supabaseAdmin()
    .from("users")
    .upsert({ id: userId, is_anonymous: isAnonymous } as never, {
      onConflict: "id",
      ignoreDuplicates: true,
    });
  if (error) throw new Error(`ensureUserRow: ${error.message}`);
}

export type ActiveDeck = {
  id: string;
  version: number;
  config: { item_ids?: string[]; order?: "shuffle" | "fixed" };
};

export async function getActiveDeck(): Promise<ActiveDeck | null> {
  const { data, error } = await supabaseAdmin()
    .from("decks")
    .select("id, version, config")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(`getActiveDeck: ${error.message}`);
  return data as ActiveDeck | null;
}

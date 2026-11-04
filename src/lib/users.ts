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
  config: {
    item_ids?: string[];
    order?: "shuffle" | "fixed";
    // Cards per person (D21), e.g. 20 of 40. Omitted means the whole deck.
    size?: number;
    // Hidden attribute key to balance each person's cards across, e.g. "style".
    balance_by?: string;
  };
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

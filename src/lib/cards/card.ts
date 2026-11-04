import { sanitizeProfile, type PublicProfile } from "./profile";

// What a phone receives for one building. Built field by field from an
// allow-list, never by passing database rows through (D9, D13). Photo credits
// are left out on purpose: Commons pages give the style away.

export type CardPhoto = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
};

export type Card = {
  id: string;
  version: number;
  profile: PublicProfile;
  photos: CardPhoto[];
  // Whether liking this card produces a match. Decided on the server (D22).
  matchOnLike: boolean;
};

export type ItemRow = { id: string; version: number; profile: unknown };
export type PhotoRow = {
  id: string;
  item_id: string;
  position: number;
  storage_path: string;
  width: number | null;
  height: number | null;
  alt_text: string;
};

export const PHOTO_BUCKET = "photos";

export function photoUrl(supabaseUrl: string, storagePath: string): string {
  const path = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

export function toCard(
  item: ItemRow,
  photos: PhotoRow[],
  supabaseUrl: string,
  matchOnLike: boolean,
): Card {
  return {
    id: item.id,
    version: item.version,
    profile: sanitizeProfile(item.profile),
    photos: photos
      .filter((p) => p.item_id === item.id)
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        id: p.id,
        url: photoUrl(supabaseUrl, p.storage_path),
        width: p.width,
        height: p.height,
        alt: p.alt_text,
      })),
    matchOnLike,
  };
}

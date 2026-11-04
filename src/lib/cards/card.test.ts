import { describe, expect, it } from "vitest";
import { toCard, type ItemRow, type PhotoRow } from "./card";
import { sanitizeProfile } from "./profile";

// D9: style labels and other hidden attributes must never reach a phone.
// These tests feed the card builder rows polluted with hidden data, the way a
// careless query or a stray profile key might, and check none of it survives.

const SECRET_STYLE = "brutalism-secret-label";

const item = {
  id: "11111111-1111-4111-8111-111111111111",
  version: 3,
  slug: "brutalist-gerald",
  style: SECRET_STYLE,
  attributes: [{ key: "style", value: SECRET_STYLE }],
  profile: {
    name: "Gerald",
    age: 54,
    tagline: "Raw and honest",
    style: SECRET_STYLE,
    architecture_type: SECRET_STYLE,
    essentials: { job_title: "Library", style: SECRET_STYLE },
    prompts: [{ question: "Q", answer: "A", style: SECRET_STYLE }],
    interests: ["concrete", 5],
  },
} as unknown as ItemRow;

const photos = [
  {
    id: "p2",
    item_id: item.id,
    position: 1,
    storage_path: "a1b2/c3.webp",
    width: 1080,
    height: 1620,
    alt_text: "Front view",
    author: "Someone",
    source_url: `https://commons.wikimedia.org/wiki/File:${SECRET_STYLE}.jpg`,
    license: "CC BY-SA 4.0",
  },
  {
    id: "p1",
    item_id: item.id,
    position: 0,
    storage_path: "d4/e5.webp",
    width: null,
    height: null,
    alt_text: "",
  },
  {
    id: "other",
    item_id: "someone-else",
    position: 0,
    storage_path: "x.webp",
    width: null,
    height: null,
    alt_text: "",
  },
] as unknown as PhotoRow[];

describe("toCard", () => {
  const card = toCard(item, photos, "https://example.supabase.co", true);
  const json = JSON.stringify(card);

  it("never contains a hidden attribute value", () => {
    expect(json).not.toContain(SECRET_STYLE);
  });

  it("never contains style, slug, or credit fields", () => {
    for (const key of ["style", "slug", "attributes", "architecture_type", "source_url", "author", "license"]) {
      expect(json).not.toContain(`"${key}"`);
    }
  });

  it("has exactly the public top-level fields", () => {
    expect(Object.keys(card).sort()).toEqual(["id", "matchOnLike", "photos", "profile", "version"]);
    for (const p of card.photos) {
      expect(Object.keys(p).sort()).toEqual(["alt", "height", "id", "url", "width"]);
    }
  });

  it("keeps public profile fields", () => {
    expect(card.profile).toEqual({
      name: "Gerald",
      age: 54,
      tagline: "Raw and honest",
      essentials: { job_title: "Library" },
      prompts: [{ question: "Q", answer: "A" }],
      interests: ["concrete"],
    });
  });

  it("orders this item's photos by position and builds storage urls", () => {
    expect(card.photos.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(card.photos[1].url).toBe(
      "https://example.supabase.co/storage/v1/object/public/photos/a1b2/c3.webp",
    );
  });
});

describe("sanitizeProfile", () => {
  it("returns an empty profile for junk", () => {
    expect(sanitizeProfile(null)).toEqual({});
    expect(sanitizeProfile("brutalism")).toEqual({});
    expect(sanitizeProfile([1, 2])).toEqual({});
  });

  it("drops values of the wrong type", () => {
    expect(sanitizeProfile({ name: 5, age: "54", verified: "yes" })).toEqual({});
  });
});

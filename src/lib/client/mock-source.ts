import type { Card } from "@/lib/cards/card";
import type { DataSource } from "./source";

// A fake 20-card deck for building the UI before the database exists. Swipes
// are kept in memory (lost on reload) and events are printed to the console.

const NAMES = [
  ["Gerald", 54], ["Beatrice", 121], ["Chad", 9], ["Imelda", 88], ["Dwayne", 31],
  ["Ophelia", 140], ["Brent", 3], ["Marguerite", 97], ["Tyler", 22], ["Agnes", 205],
  ["Kyle", 15], ["Rosalind", 63], ["Duncan", 47], ["Priscilla", 112], ["Hank", 70],
  ["Juniper", 6], ["Clifford", 58], ["Vivienne", 130], ["Rex", 40], ["Delphine", 76],
] as const;

const PALETTES = [
  ["#8ea3b8", "#3d4f61"], ["#d8b48a", "#7a4e2d"], ["#b9c6a3", "#4c5d3a"],
  ["#c7a3b5", "#5e3a4c"], ["#a3b9c7", "#2f4a5c"], ["#d6c3a1", "#6b5434"],
];

// Placeholder "photo": a gradient with a simple building silhouette.
function placeholderPhoto(seed: number, variant: number): string {
  const [top, bottom] = PALETTES[(seed + variant) % PALETTES.length];
  const floors = 3 + ((seed * 7 + variant * 3) % 8);
  const width = 140 + ((seed * 13) % 120);
  const x = (400 - width) / 2;
  const h = floors * 48;
  const windows = Array.from({ length: floors * 4 }, (_, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    return `<rect x="${x + 16 + col * ((width - 32) / 4)}" y="${600 - h + 16 + row * 48}" width="${(width - 32) / 4 - 10}" height="26" fill="#ffffff" opacity="0.35"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="600" fill="url(#g)"/><rect x="${x}" y="${600 - h}" width="${width}" height="${h}" fill="#1f2328" opacity="0.55"/>${windows}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const MOCK_CARDS: Card[] = NAMES.map(([name, age], i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  version: 1,
  matchOnLike: i % 3 === 0,
  profile: {
    name,
    age,
    verified: i % 4 === 0,
    distance: `${(0.2 + (i % 9) * 0.7).toFixed(1)} miles away`,
    tagline: "Placeholder tagline. Real copy comes later.",
    about: "Placeholder bio. The author writes the real profile copy.",
    looking_for: ["Long-term (99-year ground lease)", "Something casual (pop-up)", "Still figuring it out"][i % 3],
    essentials: { job_title: "Placeholder job", lives_in: "Placeholder city", height: `${3 + (i % 10)} storeys` },
    basics: { zodiac: "Capricorn", communication_style: "Public comment only" },
    lifestyle: { pets: "Pigeons", drinking: "Socially", sleeping: "Lights on 24/7" },
    interests: ["Setbacks", "Cornices", "Daylight"].slice(0, 1 + (i % 3)),
    prompts: [{ question: "My most irrational fear", answer: "Placeholder answer" }],
    anthem: { title: "Placeholder Song", artist: "Placeholder Artist" },
  },
  photos: Array.from({ length: 1 + (i % 3) }, (_, v) => ({
    id: `mock-photo-${i}-${v}`,
    url: placeholderPhoto(i, v),
    width: 400,
    height: 600,
    alt: "Placeholder photo of a building",
  })),
}));

const swiped = new Map<string, string>(); // swipe event id -> item id
let onboarded = false;

export const mockSource: DataSource = {
  async startSession() {
    return { userId: "mock-user", sessionId: null, onboarded };
  },

  async nextCards(n, exclude) {
    const done = new Set(swiped.values());
    const skip = new Set([...done, ...exclude]);
    const cards = MOCK_CARDS.filter((c) => !skip.has(c.id)).slice(0, n);
    return { cards, remaining: MOCK_CARDS.length - done.size };
  },

  async sendEvents(events) {
    for (const e of events) {
      console.debug("[mock event]", e.type, e.payload, e.itemId ?? "");
      if (e.type === "swipe" && e.itemId) swiped.set(e.id, e.itemId);
      if (e.type === "rewind") swiped.delete(String(e.payload.undone_event_id));
      if (e.type === "onboarding_completed") onboarded = true;
    }
    return { accepted: events.map((e) => e.id), rejected: [] };
  },
};

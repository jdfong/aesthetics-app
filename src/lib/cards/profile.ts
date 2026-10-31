// Public profile fields (docs/01-product.md). Anything stored in an item's
// profile JSON that isn't listed here is dropped before it reaches a phone,
// so a stray key can't leak a hidden attribute (D9).

type Shape = "string" | "number" | "boolean" | "strings" | { [key: string]: Shape } | [Shape];

const PROFILE_SHAPE: { [key: string]: Shape } = {
  name: "string",
  age: "number",
  verified: "boolean",
  distance: "string",
  tagline: "string",
  about: "string",
  looking_for: "string",
  essentials: {
    job_title: "string",
    company: "string",
    school: "string",
    lives_in: "string",
    height: "string",
    pronouns: "string",
  },
  basics: {
    zodiac: "string",
    education: "string",
    family_plans: "string",
    communication_style: "string",
    love_style: "string",
  },
  lifestyle: {
    pets: "string",
    drinking: "string",
    smoking: "string",
    workout: "string",
    diet: "string",
    social_media: "string",
    sleeping: "string",
  },
  interests: "strings",
  prompts: [{ question: "string", answer: "string" }],
  anthem: { title: "string", artist: "string" },
};

function pick(value: unknown, shape: Shape): unknown {
  if (shape === "string") return typeof value === "string" ? value : undefined;
  if (shape === "number") return typeof value === "number" ? value : undefined;
  if (shape === "boolean") return typeof value === "boolean" ? value : undefined;
  if (shape === "strings") {
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") : undefined;
  }
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) return undefined;
    return value.map((v) => pick(v, shape[0])).filter((v) => v !== undefined);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, sub] of Object.entries(shape)) {
    const picked = pick((value as Record<string, unknown>)[key], sub);
    if (picked !== undefined) out[key] = picked;
  }
  return out;
}

export type PublicProfile = Record<string, unknown> & { name?: string };

export function sanitizeProfile(profile: unknown): PublicProfile {
  return (pick(profile, PROFILE_SHAPE) as PublicProfile | undefined) ?? {};
}

"use client";

import type { Card } from "@/lib/client/source";
import { CheckBadge, HeartIcon, NopeIcon, StarIcon } from "./icons";
import type { Direction } from "./swipe-card";

type Profile = {
  name?: string;
  age?: number;
  verified?: boolean;
  distance?: string;
  tagline?: string;
  about?: string;
  looking_for?: string;
  essentials?: Record<string, string>;
  basics?: Record<string, string>;
  lifestyle?: Record<string, string>;
  interests?: string[];
  prompts?: { question: string; answer: string }[];
  anthem?: { title: string; artist: string };
};

const LABELS: Record<string, string> = {
  job_title: "Job title",
  company: "Company",
  school: "School",
  lives_in: "Lives in",
  height: "Height",
  pronouns: "Pronouns",
  zodiac: "Zodiac",
  education: "Education",
  family_plans: "Family plans",
  communication_style: "Communication style",
  love_style: "Love style",
  pets: "Pets",
  drinking: "Drinking",
  smoking: "Smoking",
  workout: "Workout",
  diet: "Diet",
  social_media: "Social media",
  sleeping: "Sleeping habits",
};

// The expanded profile: slides up over the card with every profile field.
export function ProfileSheet({
  card,
  onClose,
  onSwipe,
}: {
  card: Card;
  onClose: () => void;
  onSwipe: (direction: Direction) => void;
}) {
  const p = card.profile as Profile;
  const photo = card.photos[0];

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-zinc-950 text-zinc-100 animate-[sheet-up_220ms_ease-out]">
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="relative aspect-[3/4] w-full bg-zinc-800">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element -- data and storage URLs, sized by CSS
            <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="absolute bottom-0 right-5 translate-y-1/2 rounded-full bg-[var(--brand-from)] p-3 text-white shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-4 pt-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {p.name}
                {p.age !== undefined && <span className="ml-2 text-2xl font-normal">{p.age}</span>}
              </h2>
              {p.verified && <CheckBadge className="h-6 w-6" />}
            </div>
            {p.distance && <p className="mt-1 text-sm text-zinc-400">{p.distance}</p>}
          </div>

          {p.looking_for && (
            <Section title="Looking for">
              <p className="text-lg font-semibold">{p.looking_for}</p>
            </Section>
          )}
          {p.about && (
            <Section title="About me">
              <p className="leading-relaxed">{p.about}</p>
            </Section>
          )}
          <Facts title="Essentials" facts={p.essentials} />
          <Facts title="Basics" facts={p.basics} />
          <Facts title="Lifestyle" facts={p.lifestyle} />
          {p.interests && p.interests.length > 0 && (
            <Section title="Interests">
              <div className="flex flex-wrap gap-2">
                {p.interests.map((i) => (
                  <span key={i} className="rounded-full border border-zinc-600 px-3 py-1 text-sm">
                    {i}
                  </span>
                ))}
              </div>
            </Section>
          )}
          {p.prompts?.map((pr) => (
            <Section key={pr.question} title={pr.question}>
              <p className="text-lg font-semibold">{pr.answer}</p>
            </Section>
          ))}
          {p.anthem && (
            <Section title="My anthem">
              <p className="font-semibold">{p.anthem.title}</p>
              <p className="text-sm text-zinc-400">{p.anthem.artist}</p>
            </Section>
          )}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center gap-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8">
        <RoundButton label="Nope" onClick={() => onSwipe("left")} className="h-16 w-16 text-rose-500">
          <NopeIcon className="h-7 w-7" />
        </RoundButton>
        <RoundButton label="Super Like" onClick={() => onSwipe("up")} className="h-12 w-12 self-center text-sky-400">
          <StarIcon className="h-6 w-6" />
        </RoundButton>
        <RoundButton label="Like" onClick={() => onSwipe("right")} className="h-16 w-16 text-emerald-400">
          <HeartIcon className="h-7 w-7" />
        </RoundButton>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-zinc-900 p-4">
      <h3 className="mb-2 text-sm font-medium text-zinc-400">{title}</h3>
      {children}
    </section>
  );
}

function Facts({ title, facts }: { title: string; facts?: Record<string, string> }) {
  const entries = Object.entries(facts ?? {});
  if (entries.length === 0) return null;
  return (
    <Section title={title}>
      <dl className="divide-y divide-zinc-800">
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
            <dt className="text-zinc-400">{LABELS[k] ?? k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function RoundButton({
  label,
  onClick,
  className,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`pointer-events-auto flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 shadow-lg transition active:scale-90 disabled:opacity-35 ${className}`}
    >
      {children}
    </button>
  );
}

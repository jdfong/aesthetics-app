"use client";

import { LogoMark } from "./icons";

// The familiar end-of-deck radar: "There's no one new around you."
export function EmptyState({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[var(--brand-from)]/30 animate-[radar_2.4s_ease-out_infinite]" />
        <span className="absolute inset-0 rounded-full bg-[var(--brand-from)]/30 animate-[radar_2.4s_ease-out_1.2s_infinite]" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 shadow-lg">
          <LogoMark className="h-10 w-10" />
        </span>
      </div>
      <p className="mt-8 text-lg text-zinc-300">There&rsquo;s no one new around you.</p>
      <button
        type="button"
        onClick={onReveal}
        className="mt-8 rounded-full bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-8 py-3 font-semibold text-white"
      >
        See your type
      </button>
    </div>
  );
}

// Placeholder for the reveal (X3 in docs/06). Phase 5 fills this in from the
// server; for now it only shows counts the phone already knows.
export function RevealPlaceholder({ likes, nopes, supers }: { likes: number; nopes: number; supers: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <p className="text-sm uppercase tracking-widest text-zinc-500">Your Type</p>
      <h2 className="mt-2 text-4xl font-black">Coming soon</h2>
      <p className="mt-4 text-zinc-400">
        The reveal is still being designed. You liked {likes}, super liked {supers}, and passed on {nopes}.
      </p>
    </div>
  );
}

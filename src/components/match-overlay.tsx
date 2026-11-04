"use client";

import { useState } from "react";
import type { Card } from "@/lib/client/source";

// "It's a Match!" after a like on a card whose matchOnLike is true. "Send a
// message" opens the building's reply; the reply format is still to be
// designed (X2 in docs/06), so it shows a placeholder.
export function MatchOverlay({
  card,
  userInitial,
  onAction,
}: {
  card: Card;
  userInitial: string;
  onAction: (action: "message" | "keep_swiping") => void;
}) {
  const [messaging, setMessaging] = useState(false);
  const name = (card.profile as { name?: string }).name ?? "This building";
  const photo = card.photos[0];

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/85 px-6 text-center text-white backdrop-blur-sm animate-[fade-in_200ms_ease-out]">
      {!messaging ? (
        <>
          <h2 className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-6xl font-black italic leading-tight text-transparent animate-[pop_400ms_ease-out]">
            It&rsquo;s a Match!
          </h2>
          <p className="mt-3 text-lg">You and {name} liked each other.</p>

          <div className="my-10 flex items-center">
            <div className="flex h-28 w-28 -rotate-6 items-center justify-center rounded-full border-4 border-white bg-zinc-700 text-4xl font-bold">
              {userInitial}
            </div>
            <div className="-ml-4 h-28 w-28 rotate-6 overflow-hidden rounded-full border-4 border-white bg-zinc-700">
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element -- data and storage URLs, sized by CSS
                <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
              )}
            </div>
          </div>

          <button
            type="button"
            className="w-full max-w-xs rounded-full bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] py-4 text-lg font-semibold"
            onClick={() => {
              onAction("message");
              setMessaging(true);
            }}
          >
            Send a message
          </button>
          <button
            type="button"
            className="mt-3 w-full max-w-xs rounded-full border-2 border-white/60 py-4 text-lg font-semibold"
            onClick={() => onAction("keep_swiping")}
          >
            Keep swiping
          </button>
        </>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3 text-left">
          <p className="text-center text-sm text-white/60">You matched with {name}</p>
          <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-3">
            Placeholder reply. How buildings reply is still being designed.
          </div>
          <button
            type="button"
            className="mt-6 self-center rounded-full border-2 border-white/60 px-8 py-3 font-semibold"
            onClick={() => onAction("keep_swiping")}
          >
            Keep swiping
          </button>
        </div>
      )}
    </div>
  );
}

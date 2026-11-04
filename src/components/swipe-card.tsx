"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Card } from "@/lib/client/source";
import { CheckBadge, InfoIcon } from "./icons";

export type Direction = "left" | "right" | "up";
export type SwipeMethod = "drag" | "button";

export type SwipeCardHandle = { swipe: (direction: Direction) => void };

const THRESHOLD_X = 110;
const THRESHOLD_UP = 140;
const EXIT_MS = 260;

type Props = {
  card: Card;
  isTop: boolean;
  onSwiped: (direction: Direction, method: SwipeMethod) => void;
  onOpenProfile: () => void;
  onPhotoViewed: (photoId: string, index: number) => void;
};

// One profile card. The top card follows the finger, tilts, shows LIKE / NOPE
// / SUPER LIKE stamps, and flies off past a threshold. Tapping the left or
// right side of the photo flips through photos.
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { card, isTop, onSwiped, onOpenProfile, onPhotoViewed },
  ref,
) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exit, setExit] = useState<Direction | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const el = useRef<HTMLDivElement>(null);

  const fly = (direction: Direction, method: SwipeMethod) => {
    if (exit) return;
    setExit(direction);
    setTimeout(() => onSwiped(direction, method), EXIT_MS);
  };

  useImperativeHandle(ref, () => ({ swipe: (d) => fly(d, "button") }));

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isTop || exit) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    if (Math.abs(x) > 6 || Math.abs(y) > 6) start.current.moved = true;
    setDrag({ x, y, active: true });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (!s.moved) {
      setDrag({ x: 0, y: 0, active: false });
      tapPhoto(e.clientX);
      return;
    }
    if (drag.x > THRESHOLD_X) fly("right", "drag");
    else if (drag.x < -THRESHOLD_X) fly("left", "drag");
    else if (drag.y < -THRESHOLD_UP && Math.abs(drag.x) < THRESHOLD_X) fly("up", "drag");
    else setDrag({ x: 0, y: 0, active: false });
  };

  const tapPhoto = (clientX: number) => {
    const rect = el.current?.getBoundingClientRect();
    if (!rect || card.photos.length < 2) return;
    const next =
      clientX - rect.left > rect.width / 2
        ? Math.min(photoIndex + 1, card.photos.length - 1)
        : Math.max(photoIndex - 1, 0);
    if (next !== photoIndex) {
      setPhotoIndex(next);
      onPhotoViewed(card.photos[next].id, next);
    }
  };

  let x = drag.x;
  let y = drag.y;
  if (exit === "right") x = window.innerWidth * 1.5;
  if (exit === "left") x = -window.innerWidth * 1.5;
  if (exit === "up") y = -window.innerHeight * 1.2;
  const rotate = x / 18;

  const like = exit === "right" ? 1 : Math.max(0, Math.min(drag.x / THRESHOLD_X, 1));
  const nope = exit === "left" ? 1 : Math.max(0, Math.min(-drag.x / THRESHOLD_X, 1));
  const superLike =
    exit === "up" ? 1 : Math.max(0, Math.min(-drag.y / THRESHOLD_UP, 1)) * (Math.abs(drag.x) < 60 ? 1 : 0);

  const p = card.profile as {
    name?: string;
    age?: number;
    verified?: boolean;
    distance?: string;
    tagline?: string;
  };
  const photo = card.photos[photoIndex];

  return (
    <div
      ref={el}
      className="absolute inset-0 touch-none select-none overflow-hidden rounded-2xl bg-zinc-800 shadow-xl"
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
        transition: drag.active && !exit ? "none" : `transform ${EXIT_MS}ms ease-out`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- data and storage URLs, sized by CSS
        <img src={photo.url} alt={photo.alt} draggable={false} className="h-full w-full object-cover" />
      )}

      {card.photos.length > 1 && (
        <div className="absolute inset-x-2 top-2 flex gap-1">
          {card.photos.map((ph, i) => (
            <div key={ph.id} className={`h-1 flex-1 rounded-full ${i === photoIndex ? "bg-white" : "bg-white/35"}`} />
          ))}
        </div>
      )}

      <Stamp label="LIKE" opacity={like} className="left-6 top-10 -rotate-12 border-emerald-400 text-emerald-400" />
      <Stamp label="NOPE" opacity={nope} className="right-6 top-10 rotate-12 border-rose-500 text-rose-500" />
      <Stamp label="SUPER LIKE" opacity={superLike} className="bottom-40 left-1/2 -translate-x-1/2 -rotate-6 border-sky-400 text-sky-400" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-5 pt-24 text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-3xl font-bold">
                {p.name}
                {p.age !== undefined && <span className="ml-2 text-2xl font-normal">{p.age}</span>}
              </h2>
              {p.verified && <CheckBadge className="h-6 w-6 shrink-0" />}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Recently renovated</span>
            </div>
            {p.distance && <p className="mt-0.5 text-sm opacity-90">{p.distance}</p>}
            {p.tagline && <p className="mt-1 line-clamp-2 text-sm opacity-90">{p.tagline}</p>}
          </div>
          <button
            type="button"
            aria-label={`Open ${p.name ?? "profile"}`}
            className="pointer-events-auto shrink-0 rounded-full p-1 text-white/90"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onOpenProfile}
          >
            <InfoIcon className="h-7 w-7" />
          </button>
        </div>
      </div>
    </div>
  );
});

function Stamp({ label, opacity, className }: { label: string; opacity: number; className: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-lg border-4 px-3 py-1 text-3xl font-extrabold tracking-wider ${className}`}
      style={{ opacity }}
    >
      {label}
    </div>
  );
}

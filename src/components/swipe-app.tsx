"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dataSource, type Card } from "@/lib/client/source";
import { EventQueue } from "@/lib/client/event-queue";
import { APP_NAME } from "@/lib/client/brand";
import { SwipeCard, type Direction, type SwipeCardHandle, type SwipeMethod } from "./swipe-card";
import { ProfileSheet, RoundButton } from "./profile-sheet";
import { MatchOverlay } from "./match-overlay";
import { EmptyState, RevealPlaceholder } from "./empty-state";
import { Onboarding, type OnboardingAnswers } from "./onboarding";
import { BoltIcon, ChatIcon, HeartIcon, LogoMark, NopeIcon, PersonIcon, StarIcon, UndoIcon } from "./icons";

type Phase = "loading" | "error" | "onboarding" | "deck" | "reveal";
type Swiped = { card: Card; eventId: string; direction: Direction };

const PREFETCH_BELOW = 3;
const FETCH_N = 5;

// The whole app: onboarding → card stack → empty state → reveal (docs/06).
export function SwipeApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<Card[]>([]);
  const [history, setHistory] = useState<Swiped[]>([]);
  const [exhausted, setExhausted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [match, setMatch] = useState<Card | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");

  const queue = useRef<EventQueue | null>(null);
  const topRef = useRef<SwipeCardHandle>(null);
  const shownAt = useRef<number>(0);
  const profileOpenedAt = useRef<number>(0);
  const fetching = useRef(false);

  const track = useCallback(
    (type: string, opts?: { itemId?: string; itemVersion?: number; payload?: Record<string, unknown> }) =>
      queue.current?.track(type, opts) ?? "",
    [],
  );

  // Start a session, then onboarding or straight to the deck.
  useEffect(() => {
    let cancelled = false;
    const source = new URLSearchParams(window.location.search).get("src");
    dataSource
      .startSession(source)
      .then((s) => {
        if (cancelled) return;
        queue.current = new EventQueue(dataSource, s.sessionId);
        queue.current.start();
        setPhase(s.onboarded ? "deck" : "onboarding");
      })
      .catch(() => !cancelled && setPhase("error"));
    return () => {
      cancelled = true;
      queue.current?.stop();
    };
  }, []);

  // Keep a few cards ahead of the user.
  useEffect(() => {
    if (phase !== "deck" || exhausted || fetching.current || cards.length >= PREFETCH_BELOW) return;
    fetching.current = true;
    const exclude = [...cards, ...history.map((h) => h.card)].map((c) => c.id);
    dataSource
      .nextCards(FETCH_N, exclude)
      .then(({ cards: more }) => {
        setCards((current) => {
          const have = new Set(current.map((c) => c.id));
          return [...current, ...more.filter((c) => !have.has(c.id))];
        });
        if (more.length === 0) setExhausted(true);
      })
      .catch(() => {
        // Try again on the next render that needs cards.
      })
      .finally(() => {
        fetching.current = false;
      });
  }, [phase, cards, history, exhausted]);

  const top = cards[0];

  // Log each card as it comes to the top.
  useEffect(() => {
    if (phase !== "deck" || !top) return;
    shownAt.current = performance.now();
    track("card_shown", { itemId: top.id, itemVersion: top.version, payload: { position: history.length } });
    // Only when the top card changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, top?.id]);

  const onSwiped = (direction: Direction, method: SwipeMethod) => {
    if (!top) return;
    const eventId = track("swipe", {
      itemId: top.id,
      itemVersion: top.version,
      payload: {
        direction,
        method,
        dwell_ms: Math.round(performance.now() - shownAt.current),
        position: history.length,
      },
    });
    setHistory((h) => [...h, { card: top, eventId, direction }]);
    setCards((c) => c.slice(1));
    if (direction !== "left" && top.matchOnLike) {
      track("match_shown", { itemId: top.id, itemVersion: top.version });
      setMatch(top);
    }
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last) return;
    track("rewind", { itemId: last.card.id, payload: { undone_event_id: last.eventId } });
    setHistory((h) => h.slice(0, -1));
    setCards((c) => [last.card, ...c]);
    setExhausted(false);
  };

  const boost = () => {
    if (!top) return;
    track("boost_tapped", { itemId: top.id });
    const name = (top.profile as { name?: string }).name ?? "This building";
    setToast(`${name}'s profile is being upzoned.`);
    setTimeout(() => setToast(null), 2200);
  };

  const openProfile = () => {
    if (!top) return;
    profileOpenedAt.current = performance.now();
    track("profile_opened", { itemId: top.id });
    setProfileOpen(true);
  };

  const closeProfile = () => {
    if (top) {
      track("profile_closed", {
        itemId: top.id,
        payload: { dwell_ms: Math.round(performance.now() - profileOpenedAt.current) },
      });
    }
    setProfileOpen(false);
  };

  const finishOnboarding = (answers: OnboardingAnswers) => {
    track("onboarding_completed", { payload: answers });
    setFirstName(answers.first_name ?? "");
    setPhase("deck");
  };

  const reveal = () => {
    track("screen_viewed", { payload: { screen: "reveal" } });
    setPhase("reveal");
  };

  const deckDone = phase === "deck" && exhausted && cards.length === 0;
  useEffect(() => {
    if (deckDone) track("screen_viewed", { payload: { screen: "empty_state" } });
  }, [deckDone, track]);

  if (phase === "loading") {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center">
          <LogoMark className="h-14 w-14 animate-pulse" />
        </div>
      </Shell>
    );
  }

  if (phase === "error") {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-zinc-300">Couldn&rsquo;t connect. Check your connection and try again.</p>
          <button type="button" className="rounded-full border border-zinc-600 px-6 py-2" onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "onboarding") {
    return (
      <Shell>
        <Onboarding onStep={(step, answer) => track("onboarding_step", { payload: { step, answer } })} onDone={finishOnboarding} />
      </Shell>
    );
  }

  const counts = {
    likes: history.filter((h) => h.direction === "right").length,
    supers: history.filter((h) => h.direction === "up").length,
    nopes: history.filter((h) => h.direction === "left").length,
  };

  return (
    <Shell>
      <header className="flex items-center justify-between px-4 py-3">
        <PersonIcon className="h-7 w-7 text-zinc-600" />
        <div className="flex items-center gap-1.5">
          <LogoMark className="h-7 w-7" />
          <span className="text-2xl font-black tracking-tight text-[var(--brand-from)]">
            {APP_NAME}
          </span>
        </div>
        <ChatIcon className="h-7 w-7 text-zinc-600" />
      </header>

      {phase === "reveal" ? (
        <RevealPlaceholder {...counts} />
      ) : deckDone ? (
        <EmptyState onReveal={reveal} />
      ) : (
        <>
          <div className="relative mx-2 flex-1">
            {cards.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LogoMark className="h-12 w-12 animate-pulse" />
              </div>
            )}
            {cards
              .slice(0, 2)
              .reverse()
              .map((card) => (
                <SwipeCard
                  key={card.id}
                  ref={card.id === top?.id ? topRef : undefined}
                  card={card}
                  isTop={card.id === top?.id}
                  onSwiped={onSwiped}
                  onOpenProfile={openProfile}
                  onPhotoViewed={(photoId, index) => track("photo_viewed", { itemId: card.id, payload: { photo_id: photoId, index } })}
                />
              ))}
          </div>

          <div className="flex items-center justify-center gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <RoundButton label="Undo" onClick={undo} disabled={history.length === 0} className="h-12 w-12 text-amber-400">
              <UndoIcon className="h-6 w-6" />
            </RoundButton>
            <RoundButton label="Nope" onClick={() => topRef.current?.swipe("left")} disabled={!top} className="h-16 w-16 text-rose-500">
              <NopeIcon className="h-8 w-8" />
            </RoundButton>
            <RoundButton label="Super Like" onClick={() => topRef.current?.swipe("up")} disabled={!top} className="h-12 w-12 text-sky-400">
              <StarIcon className="h-6 w-6" />
            </RoundButton>
            <RoundButton label="Like" onClick={() => topRef.current?.swipe("right")} disabled={!top} className="h-16 w-16 text-emerald-400">
              <HeartIcon className="h-8 w-8" />
            </RoundButton>
            <RoundButton label="Boost" onClick={boost} disabled={!top} className="h-12 w-12 text-violet-400">
              <BoltIcon className="h-6 w-6" />
            </RoundButton>
          </div>
        </>
      )}

      {profileOpen && top && (
        <ProfileSheet
          card={top}
          onClose={closeProfile}
          onSwipe={(d) => {
            closeProfile();
            setTimeout(() => topRef.current?.swipe(d), 50);
          }}
        />
      )}

      {match && (
        <MatchOverlay
          card={match}
          userInitial={firstName.trim().charAt(0).toUpperCase() || "🙂"}
          onAction={(action) => {
            track("match_action", { itemId: match.id, payload: { action } });
            if (action === "message") track("message_opened", { itemId: match.id });
            else setMatch(null);
          }}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 top-20 z-50 mx-auto w-fit max-w-[90%] rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg animate-[fade-in_150ms_ease-out]">
          {toast}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-zinc-950 text-zinc-100">{children}</div>;
}

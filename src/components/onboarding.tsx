"use client";

import { useState } from "react";
import { LogoMark } from "./icons";
import { APP_NAME } from "@/lib/client/brand";

// The fake sign-up (docs/06 §1). Collects nothing personal; every step after
// Welcome can be skipped. Answers are logged as events.

export type OnboardingAnswers = {
  first_name?: string;
  i_am?: string;
  show_me?: string;
  max_distance_min?: number;
  looking_for?: string;
};

type Step =
  | { id: "first_name"; kind: "text"; title: string; placeholder: string }
  | { id: "i_am" | "show_me" | "looking_for"; kind: "choice"; title: string; options: string[] }
  | { id: "max_distance_min"; kind: "slider"; title: string; min: number; max: number };

const STEPS: Step[] = [
  { id: "first_name", kind: "text", title: "My first name is", placeholder: "First name" },
  {
    id: "i_am",
    kind: "choice",
    title: "I am a…",
    options: ["YIMBY", "NIMBY", "Planner", "Developer", "Just here for the free coffee"],
  },
  { id: "show_me", kind: "choice", title: "Show me", options: ["Buildings", "Infrastructure", "Everyone"] },
  { id: "max_distance_min", kind: "slider", title: "Maximum distance", min: 1, max: 60 },
  {
    id: "looking_for",
    kind: "choice",
    title: "Looking for",
    options: [
      "Long-term (99-year ground lease)",
      "Something casual (pop-up)",
      "Still figuring it out (pending environmental review)",
    ],
  },
];

export function Onboarding({
  onStep,
  onDone,
}: {
  onStep: (step: string, answer: unknown) => void;
  onDone: (answers: OnboardingAnswers) => void;
}) {
  const [index, setIndex] = useState(-1); // -1 = welcome
  const [answers, setAnswers] = useState<OnboardingAnswers>({ max_distance_min: 15 });

  if (index === -1) {
    return (
      <div className="flex flex-1 flex-col items-center justify-between bg-gradient-to-br from-[var(--brand-from)] to-[var(--brand-to)] px-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 text-white">
        <div className="flex flex-col items-center">
          <div className="rounded-3xl bg-white p-4 shadow-xl">
            <LogoMark className="h-14 w-14" />
          </div>
          <h1 className="mt-5 text-5xl font-black tracking-tight">{APP_NAME}</h1>
          <p className="mt-3 text-lg text-white/90">Placeholder tagline.</p>
        </div>
        <div className="w-full max-w-sm">
          <p className="mb-5 text-center text-xs text-white/80">
            By tapping Create account you agree to nothing. We don&rsquo;t collect anything personal.
          </p>
          <button
            type="button"
            className="w-full rounded-full bg-white py-4 text-lg font-semibold text-zinc-900"
            onClick={() => setIndex(0)}
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  const step = STEPS[index];
  const value = answers[step.id];
  const next = (answer: unknown) => {
    const updated = { ...answers, [step.id]: answer };
    setAnswers(updated);
    onStep(step.id, answer ?? null);
    if (index + 1 < STEPS.length) setIndex(index + 1);
    else onDone(updated);
  };

  return (
    <div className="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Back"
          className="p-2 text-2xl text-zinc-400"
          onClick={() => setIndex(index - 1)}
        >
          ‹
        </button>
        <button type="button" className="p-2 text-sm font-semibold text-zinc-400" onClick={() => next(undefined)}>
          Skip
        </button>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-zinc-800">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] transition-all"
          style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-10 text-4xl font-bold">{step.title}</h2>

      <div className="mt-8 flex-1">
        {step.kind === "text" && (
          <input
            autoFocus
            maxLength={30}
            placeholder={step.placeholder}
            className="w-full border-b-2 border-zinc-600 bg-transparent py-2 text-2xl outline-none focus:border-[var(--brand-from)]"
            value={(value as string | undefined) ?? ""}
            onChange={(e) => setAnswers({ ...answers, first_name: e.target.value })}
          />
        )}
        {step.kind === "choice" && (
          <div className="flex flex-col gap-3">
            {step.options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => next(o)}
                className={`rounded-full border-2 px-5 py-3 text-left font-semibold transition ${
                  value === o ? "border-[var(--brand-from)] text-[var(--brand-from)]" : "border-zinc-700"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {step.kind === "slider" && (
          <div>
            <div className="mb-4 flex justify-between text-zinc-400">
              <span>Distance preference</span>
              <span className="font-semibold text-zinc-100">{value as number} minutes from transit</span>
            </div>
            <input
              type="range"
              min={step.min}
              max={step.max}
              value={value as number}
              onChange={(e) => setAnswers({ ...answers, max_distance_min: Number(e.target.value) })}
              className="w-full accent-[var(--brand-from)]"
            />
          </div>
        )}
      </div>

      {step.kind !== "choice" && (
        <button
          type="button"
          className="w-full rounded-full bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] py-4 text-lg font-semibold text-white"
          onClick={() => next(step.kind === "text" ? (value as string)?.trim() || undefined : value)}
        >
          Continue
        </button>
      )}
    </div>
  );
}

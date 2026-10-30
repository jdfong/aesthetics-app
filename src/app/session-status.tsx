"use client";

import { useEffect, useState } from "react";

type SessionState =
  | { status: "loading" }
  | { status: "ready"; userId: string; isNew: boolean }
  | { status: "error" };

// Phase 1 placeholder: proves a phone gets a stable anonymous user id.
export function SessionStatus() {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/session", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setState({ status: "ready", userId: body.userId, isNew: body.isNew });
      })
      .catch(() => setState({ status: "error" }));
  }, []);

  if (state.status === "loading") {
    return <p className="text-sm opacity-60">Starting session…</p>;
  }
  if (state.status === "error") {
    return <p className="text-sm text-red-600">Couldn’t start a session.</p>;
  }
  return (
    <div className="text-sm">
      <p>{state.isNew ? "New visitor" : "Welcome back"}</p>
      <p className="mt-1 font-mono text-xs break-all opacity-60">
        {state.userId}
      </p>
    </div>
  );
}

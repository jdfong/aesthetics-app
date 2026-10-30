import { SessionStatus } from "./session-status";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">aesthetics-app</h1>
      <p className="opacity-70">Skeleton build. Swiping arrives in phase 3.</p>
      <SessionStatus />
    </main>
  );
}

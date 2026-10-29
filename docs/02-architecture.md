# Architecture

## Extensibility rules

These are the rules for "don't preclude future features." Every later design choice
should be checked against them.

1. **Log raw events, derive everything else.** Store what happened (who, what item,
   what action, when, in what context). Results, scores, matches and recommendations are
   computed from the log, never stored as the only source of truth.
2. **Event types are data, not schema.** A new interaction ("double-tap", "share",
   "argued with a friend about it") is a new `type` string with a JSON payload, with no
   migration.
3. **One server API between the client and everything else.** The client never talks to
   the database. We can change storage, add logic or hide fields without touching the
   client.
4. **The server decides what to serve next.** The client asks "give me the next cards"
   rather than downloading the whole deck. That keeps ordering, A/B variants, adaptive
   decks and per-user experiences possible later, and stops the client from seeing
   cards (or their metadata) early.
5. **Identity from the first request, credentials optional.** Every visitor gets a stable
   user id immediately. Logging in later attaches credentials to the *same* id.
6. **Version content.** Items, decks and profile copy carry versions, so an event always
   points to exactly what the user saw.
7. **Hidden attributes stay on the server.** Labels like style are stored apart from
   public profile data and only reach the client through endpoints built to reveal them.

## Proposed stack

| Layer | Choice | Why |
| --- | --- | --- |
| App framework | **Next.js (App Router), TypeScript** | Frontend and server API in one project and one deploy; huge ecosystem |
| Hosting | **Vercel** | Free tier, git-push deploys, preview URLs for testing on a phone |
| Database | **Supabase Postgres** | Real relational DB with JSONB for flexible payloads; free tier; SQL for later analysis |
| Identity | **Supabase Auth with anonymous sign-in** | Built-in anonymous users that can later be linked to email/OAuth on the same user id (rule 5) |
| Image storage | **Supabase Storage** (or `/public` in the repo if small enough) | Self-hosted, resized copies (see 04) |
| Swipe gestures | A small gesture library (e.g. `@use-gesture/react` + a spring library) | Natural swipe physics on touch screens |
| Styling | Tailwind CSS | Fast to build mobile-first layouts |

Alternatives considered:

- **Static site + serverless functions + a hosted KV store.** Simpler at first, but
  per-user querying and later analysis get painful. Rejected for D4/D5.
- **Firebase.** Comparable, but Firestore makes ad hoc relational analysis ("how did
  people who liked X swipe on Y?") harder than Postgres. Supabase's anonymous-to-real
  account linking is equivalent.
- **Rolling our own anonymous identity** (signed cookie + users table). Totally viable
  and portable, but we'd write the account-upgrade path ourselves later. Fine as a
  fallback if Supabase Auth gets in the way.

## Identity flow

1. First visit: the client calls Supabase anonymous sign-in → gets a session for a new
   `user_id`. The session persists in the browser.
2. Every API call carries the session. The server verifies it and attaches `user_id` to
   every event.
3. Optional, later: nickname, then real login (magic link / Google) linked to the same
   `user_id`. Nothing in this iteration requires it.

Known limitation: clearing browser data or switching browsers creates a new anonymous
user. That's acceptable for a conference joke; a real login fixes it if needed.

## Server API (shape, not final)

| Endpoint | Purpose |
| --- | --- |
| `POST /api/session` | Ensure the user exists; return user id + current deck/session |
| `GET /api/cards/next?n=5` | Next N cards for this user (public profile fields only) |
| `POST /api/events` | Batch of interaction events (idempotent, see below) |
| `GET /api/me/summary` | Per-user derived experience. Placeholder for later passes |

All responses are built from explicit allow-listed DTOs, never by passing database rows
through.

## Keeping style labels hidden (D9)

Ways labels can leak, and the mitigation for each:

| Leak | Mitigation |
| --- | --- |
| API response includes the label | Labels live in a separate table; card DTOs are allow-listed; an automated test checks that no card payload contains label fields |
| Client queries DB directly | It can't. Database access is server-only (rule 3); row-level security denies the public key everything |
| Image filenames or URLs (`brutalist-03.webp`) | Images are stored under opaque ids |
| Image alt text | Alt text describes what's visible, not the style |
| Commons attribution links | Commons file pages show categories that often name the style. Credits stay out of the swipe flow, on a separate credits screen or after the reveal |
| Building name or profile copy | Content guideline: copy can hint but shouldn't name the style outright (the author's call) |
| Public GitHub repo containing the label data | **Open: Q3** |
| Whole deck preloaded in the client | Cards are served a few at a time (rule 4) |

## Conference network resilience

- Events are queued in the browser and sent in batches; if the network drops, they're
  retried later, and nothing blocks the swipe.
- Each event has a client-generated UUID, so retried batches don't create duplicates.
- The next few cards and their images are prefetched ahead of the user.
- Images are small, pre-sized WebP files (see 04).

## Privacy and safety basics

- No personal data is required. Anonymous by default.
- Short "what we log" note on first screen or an about page.
- Basic rate limiting on the events endpoint so one person can't flood the log.
- The public repo holds no secrets; keys go in environment variables.

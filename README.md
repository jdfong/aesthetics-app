# aesthetics-app

A satirical swipe-to-match app where the profiles are buildings. You swipe on architecture
the way you'd swipe on people. Built for a housing conference, mobile web only.

Status: **phase 1 (skeleton)**. See the build plan in `docs/05-plan-and-open-questions.md`.

## Running locally

1. `npm install`
2. `cp .env.example .env.local` and fill in the Supabase values (see comments in the file).
3. `npm run dev`, then open http://localhost:3000.

The same environment variables must be set in the Vercel project settings.

## Planning docs

| Doc | What it covers |
| --- | --- |
| [docs/00-decisions.md](docs/00-decisions.md) | Decision log: what's settled, what's proposed, what's open |
| [docs/01-product.md](docs/01-product.md) | Premise, goals, non-goals, user flow, profile fields |
| [docs/02-architecture.md](docs/02-architecture.md) | Stack, extensibility rules, identity, keeping style labels hidden |
| [docs/03-data-model.md](docs/03-data-model.md) | Tables and the interaction event log |
| [docs/04-content.md](docs/04-content.md) | Sourcing images from Wikimedia Commons, licensing, attribution |
| [docs/05-plan-and-open-questions.md](docs/05-plan-and-open-questions.md) | Build phases, timeline, open questions |

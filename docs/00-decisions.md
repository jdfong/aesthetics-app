# Decision log

Status key: **Decided** = the user said so. **Proposed** = recommended, waiting on sign-off.
**Open** = not yet answered.

| # | Decision | Status | Notes |
| --- | --- | --- | --- |
| D1 | It's a satirical swipe app with buildings as profiles, a joke and conversation piece for a housing conference | Decided | Not meant to be methodologically sound research |
| D2 | Mobile web only, no App Store | Decided | Must work well in iOS Safari and Android Chrome |
| D3 | Repo lives at `~/code/aesthetics-app`, public, on personal GitHub (`jdfong`) | Decided | Moved off `~/Desktop` on Nov 3 because iCloud Desktop sync made builds take minutes. Keep it out of iCloud-synced folders |
| D4 | There's a backend that logs every interaction per user and can serve per-user experiences based on that history | Decided | Exact interactions not settled, so the design has to stay generic (see 02, 03) |
| D5 | Architecture must not rule out future features | Decided | Applied through the extensibility rules in 02 |
| D6 | 40 images across 8 architecture types to start | Decided | Schema doesn't assume these numbers |
| D7 | Images come from Wikimedia Commons, openly licensed only | Decided | See 04 for which licenses are allowed |
| D8 | Each building gets a dating-style profile. Fields only for now, content written later | Decided | Field list in 01 |
| D9 | Style labels are never sent to the client during the swipe experience | Decided | How they'll be used later is up to the user; see 02 for how they stay hidden |
| D10 | Use an original name and visual identity, not the dating app's name, logo or marks | Decided | The swipe mechanic gets the joke across on its own |
| D11 | Stack: Next.js (TypeScript) on Vercel, with Supabase Postgres + Auth | Decided | Reasoning in 02 |
| D12 | Identity: anonymous account created on first visit, upgradable to a real login later without losing history | Decided | Lets per-user features work without a sign-up wall |
| D13 | All data goes through our own server API; the browser never queries the database directly | Decided | Main defense for D9 and keeps the API stable |
| D14 | Interactions are stored as an append-only event log | Decided | New interaction types need no schema change |
| D15 | Images are copied, resized and self-hosted, not hotlinked from Commons | Decided | Holds up on conference wifi, follows Commons' guidance |
| D16 | Style labels aren't kept in the public repo | Decided | Manifest with labels lives in gitignored `content/private/`; it only reaches the database through the seed step (see 04) |
| D17 | Git author email for this repo is the GitHub no-reply address `31712126+jdfong@users.noreply.github.com` | Decided | Set in repo-local git config; global config untouched |
| D18 | Everything is done by **Fri Nov 14, 2026** | Decided | Schedule in 05 |
| D19 | The experience parodies dating-app layout and conventions closely, screen by screen | Decided | Full spec in 06 |
| D20 | Fake onboarding with joke answers ("I am a…", "Looking for…"); nothing personal collected | Decided | Answers logged as events for later comparisons |
| D21 | Each person gets 20 of the 40 buildings, stable per person | Decided | **Proposed addition:** balance the 20 across the 8 types (2–3 each), so every reveal has something to say. Uses labels on the server only |
| D22 | Matches exist; the server decides them and each card says whether liking it matches | Decided | The rule itself is open (X1 in 06) |
| D23 | Buildings reply after a match; no free chat between people | Decided | Reply format open (X2 in 06) |
| D24 | The deck ends with a reveal of the person's type | Decided | Contents open (X3 in 06) |
| D25 | No upsell / paywall jokes | Decided | Cut |

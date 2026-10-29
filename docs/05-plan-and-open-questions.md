# Build plan and open questions

## Phases

Hard deadline: **done by Fri Nov 14, 2026** (D18). Planning finished Wed Oct 29, which
leaves about two weeks. Content (photos and profile copy) is the author's critical path,
so it runs alongside phases 2–3 rather than after them.

| Phase | Outcome | Target dates |
| --- | --- | --- |
| 0. Planning | These docs signed off | Oct 29 |
| 1. Skeleton | Next.js app deployed to a Vercel URL; Supabase project; anonymous sign-in working on a phone | Oct 30 |
| 2. Data + API | Schema from 03; `/api/session`, `/api/cards/next`, `/api/events`; label-leak test | Oct 31 – Nov 2 |
| 3. Swipe UI | Card stack, gestures + buttons, photo carousel, profile sheet, rewind, event queue | Nov 3 – 5 |
| 4. Content | Manifest → fetch → process → seed for 40 images; credits screen. Author picks images from Oct 30 | Manifest by Nov 5; seeded by Nov 7 |
| 5. Experience pass | Match moments, end-of-deck/results based on per-user history | Nov 8 – 10 |
| 6. Hardening | Real-device testing (iOS Safari, Android Chrome), slow-network test, rate limit, QR code | Nov 11 – 12 |
| Freeze | Only fixes from here on | Nov 13 |
| Done | Live and ready to share | Nov 14 |

If something slips, cut from phase 5 first. The core swipe-and-log loop with real
content is the minimum.

## Open questions

| # | Question | Blocks |
| --- | --- | --- |
| Q1 | ~~What's the conference date?~~ Resolved: done by Nov 14 (D18) | — |
| Q2 | How will people get it: QR code on a slide, badge or sticker; a posted link; both? | Phase 6, `context` tagging |
| Q3 | ~~Should style labels stay out of the public repo?~~ Resolved: yes (D16) | — |
| Q4 | Your own experience with deploying web apps: do you want to do some of the setup (Vercel, Supabase accounts), or should the plan assume you only provide content and approve? Either way you'll need to create those accounts yourself | Phase 1 |
| Q5 | App name and visual identity (D10): any ideas? | Phase 3 polish, not the build |
| Q6 | ~~Git author email~~ Resolved: GitHub no-reply address (D17) | — |
| Q7 | OK with Vercel + Supabase free tiers, i.e. third-party hosting with no cost? | Phase 1 |
| Q8 | Rough idea of what the end-of-deck experience is: results, reveal of styles, comparison to the room? Not needed now, but helps pick the first derived queries | Phase 5 |

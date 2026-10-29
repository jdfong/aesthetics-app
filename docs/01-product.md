# Product

## Premise

The online fight over aesthetics in urbanism keeps getting stuck on definitions. This app
skips the definitions. People at the conference swipe on buildings the way they'd swipe on
dates, and the app (privately) knows which style each building is. Later, it can tell
people things about their own taste that they may not want to hear.

Audience: housing and urbanism people at one conference, many of them people the author
has friendly disagreements with. Reached by link or QR code on a phone.

## Goals

- Fun inside 10 seconds: open the link, swipe right away, no sign-up wall.
- Every interaction is logged per user, so later passes can build experiences on top of it
  (results, comparisons, reveals, matches) without re-architecting.
- Holds up on a crowded conference network.
- Feels like a dating app (cards, swipe physics, profile sheets, a match moment)
  without copying any specific app's branding.

## Non-goals (this iteration)

- Native apps or App Store distribution.
- Social science rigor (randomized ordering, sampling, survey validity). We log enough
  that we *could* look at it later, but don't design for it.
- Messaging between users.
- An admin UI. Content is loaded from files or a seed script.
- Desktop polish. It should work on desktop but isn't designed for it.

## Core loop

1. **Open link.** An anonymous user is created silently (see 02).
2. **Card stack.** One building at a time: main photo, name, age, short tagline.
3. **Interact** with the card:
   - swipe left / "nope" button
   - swipe right / "like" button
   - swipe up / "super like" button
   - tap the left or right edge of the photo to cycle through its photos
   - tap the name or info icon to open the full profile sheet
   - rewind (undo the last swipe)
4. **Feedback moments** (content to come). For example, a "match" screen on some likes.
5. **End of deck / results.** Placeholder for now. This is where per-user experiences
   built on the interaction history will go.

Every step above is logged as an event, including the passive ones (card shown, profile
opened, photo cycled, how long the card was on screen). See 03.

**Never shown in the swipe experience:** the building's architectural style or type,
or anything that gives it away (see the leakage list in 02).

## Profile fields

These mirror the field layout of a typical dating-app profile so the parody reads right.
Content gets written later. Every field is optional except `name` and at least one photo.

**Card (front)**

| Field | Shown as | Example placeholder |
| --- | --- | --- |
| Photos (1–9) | Swipeable photo carousel with progress bars | — |
| Name | Large, bold | "Gerald" |
| Age | Next to name | Years since completion |
| Verified badge | Check icon | Could mean landmark-listed, etc. |
| Distance | "12 miles away" | Joke distance or real one |
| Tagline / short bio | One or two lines under name | — |

**Profile sheet (expanded)**

| Section | Fields |
| --- | --- |
| About me | Free-text bio |
| Looking for | Relationship intent (e.g. "Long-term", "Still figuring it out") |
| Essentials | Job title, company, school, lives in, height (storeys), pronouns |
| Basics | Zodiac, education, family plans, communication style, love style |
| Lifestyle | Pets, drinking, smoking, workout, dietary preference, social media, sleeping habits |
| Interests | Chips/tags (up to ~5) |
| Prompts | 1–3 question/answer pairs ("My most irrational fear…") |
| Anthem | Song title + artist (display only, no playback) |
| Credits | Photo attribution (required by license, see 04) |

The field set is stored flexibly (see 03), so adding, renaming or dropping a field is a
content change, not a schema migration.

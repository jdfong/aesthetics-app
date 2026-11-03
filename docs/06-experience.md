# Product experience

The app should feel comically close to a dating app: its layout, conventions and
clichés, with buildings as the profiles. It doesn't use any real app's name, logo or
exact colors (D10). Copy is placeholder throughout; the author writes the real copy.

Each screen lists what gets logged. Every log entry is an event (docs/03), so adding
or changing these needs no database change.

## Flow

```
Onboarding ──▶ Card stack ◀──▶ Expanded profile
                   │
                   ├──▶ It's a match ──▶ Building reply
                   │
                   ▼  (after 20 swipes)
              Empty state ──▶ Your Type (reveal)
```

## 1. Onboarding (fake sign-up)

A parody of dating-app sign-up. It collects nothing personal and has no password or
email. The anonymous account already exists (D12).

| Step | Content (placeholder) | Notes |
| --- | --- | --- |
| Welcome | App name, tagline, "Create account" button | Button goes straight to the next step |
| First name | Text field, optional | Shown only back to that person (e.g. on the reveal) |
| I am a… | YIMBY / NIMBY / Planner / Developer / Just here for the free coffee | Single choice |
| Show me | Buildings / Infrastructure / Everyone | Joke; has no effect |
| Maximum distance | Slider, "minutes from transit" | Joke; has no effect |
| Looking for | Long-term (99-year ground lease) / Something casual (pop-up) / Still figuring it out (pending environmental review) | Single choice |
| Done | "You're all set" → card stack | |

- Every step after Welcome can be skipped.
- Onboarding shows once per user. Returning visitors go straight to the cards.
- *Logged:* `onboarding_step` (step, answer), `onboarding_completed` (all answers).
  The answers make room comparisons possible later, e.g. "NIMBYs liked X more."

## 2. Card stack

| Element | Behavior |
| --- | --- |
| Photo | Fills the card. Tap the right or left side for the next or previous photo; progress bars at the top |
| Name, age | "Gerald, 54" |
| Badges | Verified check; "Recently renovated" green dot; distance ("0.4 miles away") |
| Tagline | One line under the name |
| Info icon / tap name | Opens the expanded profile |
| Drag | Card follows the finger and tilts; **LIKE** / **NOPE** stamps fade in; past a threshold it flies off. Dragging up = Super Like |
| Buttons | Undo · Nope · Super Like · Like · Boost |
| Boost | Joke only: brief toast, e.g. "Gerald's profile is being upzoned." No effect |
| Undo | Brings back the last card. Unlimited |

- Never shows the style or anything that gives it away (D9, docs/02).
- *Logged:* `card_shown`, `swipe` (direction left/right/up, method drag/button,
  dwell_ms, position in deck), `rewind`, `photo_viewed`, `boost_tapped`.

## 3. Expanded profile

A sheet that slides up over the card, with all profile fields from docs/01: About me,
Looking for, Essentials, Basics, Lifestyle, Interests, Prompts, Anthem. Nope, Super
Like and Like buttons stay available at the bottom.

- *Logged:* `profile_opened`, `profile_closed` (dwell_ms).

## 4. It's a match

Real-app pattern: big "It's a Match!" type, both photos, "Send a message" and "Keep
swiping".

- Can happen after a Like or Super Like.
- **The match rule is not decided yet.** Whatever it turns out to be (per-building
  pickiness, room popularity, pure chance, a mix), the server decides it, so the rule
  stays hidden and can change without touching the phone. Each card says whether
  liking it produces a match.
- The person's "photo" in the match screen is a placeholder (initial or emoji), since
  we have no photo of them.
- *Logged:* `match_shown`, `match_action` (message / keep_swiping).

## 5. Building replies

"Send a message" leads to the building replying. **Format not decided yet** (canned
one-liners per building, a short scripted exchange, something else). What's settled:
replies are per-building content written by the author, and there's no free-form chat
between people.

- *Logged:* `message_opened`, plus whatever the format needs later.

## 6. End of deck and reveal

- **Deck:** each person gets **20 buildings out of the 40**, in a stable order that
  survives reloads (see D21 on balancing across types).
- **Empty state:** after the 20th swipe, the familiar pulsing radar and "There's no
  one new around you."
- **Your Type:** then the reveal, where the hidden labels finally come out. **Exact
  content not decided yet.** Likely ingredients: your right-swipe share by style, a
  joke verdict, a shareable screenshot card, and maybe a comparison with the room.
- *Logged:* `screen_viewed` (empty_state, reveal), `reveal_shared`.

## Cut

- **Upsells / paywall jokes** (out of likes, premium tiers, "who likes you" blur).
  Cut by the author.

## Still to design

| # | What | Needed by |
| --- | --- | --- |
| X1 | Match rule | Phase 5 (phase 3 builds the match screen with a stand-in rule) |
| X2 | Building reply format | Phase 5 |
| X3 | Reveal contents, and whether it compares with the room | Phase 5 |
| X4 | App name and look | Phase 3 polish |

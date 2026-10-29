# Data model

Postgres. Names are working names, so don't treat this as final DDL. Fields marked *(json)* are JSONB
so their contents can change without a migration.

## Content

**items**: one per building (the "profile").

| Column | Notes |
| --- | --- |
| `id` | Opaque id (not derived from name or style) |
| `slug` | Internal only, not shown |
| `version` | Bumped when profile content changes |
| `profile` *(json)* | All profile fields from 01 (name, age, bio, essentials, basics, prompts…). Public by design |
| `is_active` | Hide without deleting |
| `created_at`, `updated_at` | |

**item_photos**

| Column | Notes |
| --- | --- |
| `id`, `item_id`, `position` | Order in the carousel |
| `storage_path` | Opaque path to our resized copy |
| `width`, `height`, `alt_text` | Alt text must not name the style |
| `source_url` | Commons file page |
| `author`, `license`, `license_url`, `attribution_text` | Required for credits |

**attributes**: hidden, server-only. The style label lives here.

| Column | Notes |
| --- | --- |
| `item_id` | |
| `key` | e.g. `style`. Generic, so other hidden attributes (era, city, "is it actually housing") can be added later |
| `value` | e.g. one of the 8 types |
| `source` | Who/what labeled it (hand-coded for now) |

**decks**: a named, versioned list or rule for which items get served and in what order.

| Column | Notes |
| --- | --- |
| `id`, `name`, `version` | |
| `config` *(json)* | Item list and ordering rule (fixed, shuffled, adaptive later) |

## People

**users**: one row per Supabase auth user (anonymous or not).

| Column | Notes |
| --- | --- |
| `id` | Same as the auth user id |
| `is_anonymous` | Flips when a login is linked |
| `display_name` | Optional, later |
| `metadata` *(json)* | Room for later fields (e.g. "which conference", self-described aesthetic camp) |
| `created_at` | |

**sessions**: one per visit/run through a deck.

| Column | Notes |
| --- | --- |
| `id`, `user_id`, `deck_id`, `deck_version` | |
| `started_at`, `ended_at` | |
| `context` *(json)* | User agent class, viewport, referrer/QR source, app version |

## Interaction log

**events**: append-only. Never updated or deleted in normal operation.

| Column | Notes |
| --- | --- |
| `id` | Client-generated UUID (makes retries idempotent) |
| `user_id`, `session_id` | |
| `item_id`, `item_version` | Nullable for events that aren't about an item |
| `type` | e.g. `card_shown`, `swipe`, `profile_opened`, `photo_viewed`, `rewind`, `match_shown` |
| `payload` *(json)* | Type-specific detail, e.g. `{direction: "right", dwell_ms: 2300, position: 7}` |
| `client_ts` | When it happened on the device |
| `server_ts` | When we received it |

Initial event types (more can be added any time):

| type | payload |
| --- | --- |
| `card_shown` | `position` |
| `swipe` | `direction` (left / right / up), `method` (gesture / button), `dwell_ms`, `position` |
| `rewind` | `undone_event_id` |
| `profile_opened` / `profile_closed` | `dwell_ms` |
| `photo_viewed` | `photo_id`, `index` |
| `screen_viewed` | `screen` (e.g. results, credits) |

"Current state" (e.g. the user's latest decision on an item after rewinds) is derived by
querying the log, possibly through a database view. If a derived table is ever needed for
speed, it gets rebuilt from `events`, never edited by hand.

## Indexes worth having from day one

- `events (user_id, server_ts)` for per-user history and experiences
- `events (item_id, type)` for per-building aggregates
- unique `events (id)` for idempotency

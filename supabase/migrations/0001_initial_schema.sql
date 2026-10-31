-- Initial schema. See docs/03-data-model.md.
--
-- Access model (D13): the browser never queries these tables. Only our server
-- reads and writes them, using the secret key, which bypasses row-level
-- security. RLS is enabled with no policies, and the public roles' grants are
-- revoked, so the publishable key can read nothing.

-- Content ---------------------------------------------------------------

create table public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,               -- internal only, never sent to clients
  version int not null default 1,
  profile jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.item_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  position int not null default 0,
  storage_path text not null,              -- opaque, must not reveal the style
  width int,
  height int,
  alt_text text not null default '',       -- describes what's visible, not the style
  source_url text,
  author text,
  license text,
  license_url text,
  attribution_text text,
  unique (item_id, position)
);

-- Hidden attributes such as the style label (D9). Server-only.
create table public.item_attributes (
  item_id uuid not null references public.items (id) on delete cascade,
  key text not null,
  value text not null,
  source text,
  primary key (item_id, key)
);

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version int not null default 1,
  -- {"item_ids": [...]} limits the deck; omitted means every active item.
  -- {"order": "shuffle" | "fixed"}; shuffle is stable per user.
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one active deck at a time.
create unique index decks_one_active on public.decks (is_active) where is_active;

-- People ----------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  is_anonymous boolean not null default true,
  display_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  deck_id uuid references public.decks (id),
  deck_version int,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  context jsonb not null default '{}'::jsonb
);

create index sessions_user on public.sessions (user_id, started_at);

-- Interaction log (D14) -------------------------------------------------
-- Append-only. The id is generated on the device so retried batches are
-- idempotent. New event types need no migration, only a new type string.

create table public.events (
  id uuid primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  item_id uuid references public.items (id),
  item_version int,
  type text not null check (type ~ '^[a-z][a-z0-9_]{0,39}$'),
  payload jsonb not null default '{}'::jsonb,
  client_ts timestamptz,
  server_ts timestamptz not null default now()
);

create index events_user_time on public.events (user_id, server_ts);
create index events_item_type on public.events (item_id, type);

-- Lock down -------------------------------------------------------------

alter table public.items enable row level security;
alter table public.item_photos enable row level security;
alter table public.item_attributes enable row level security;
alter table public.decks enable row level security;
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.events enable row level security;

revoke all on
  public.items, public.item_photos, public.item_attributes, public.decks,
  public.users, public.sessions, public.events
from anon, authenticated;

-- 001: Tables, constraints and indexes
-- Row Level Security is enabled on every table right away, so a table is never
-- reachable through the API before its policies exist (002_rls.sql).

-- Tags: at most 10, each 1-30 characters, lowercase, no duplicates.
-- Check constraints can't contain subqueries, so the per-tag rules live in an
-- immutable helper function.
create function public.tags_are_valid(tags text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    bool_and(tag is not null and char_length(tag) between 1 and 30 and tag = lower(tag)),
    true
  )
  and count(*) = count(distinct tag)
  from unnest(tags) as tag;
$$;

-- Profiles ----------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text,
  created_at timestamptz not null default now(),

  constraint profiles_username_format check (username ~ '^[a-z0-9]{3,30}$'),
  constraint profiles_display_name_length
    check (char_length(btrim(display_name)) >= 1 and char_length(display_name) <= 50),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500)
);

create unique index profiles_username_lower_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Projects ----------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_title_length
    check (char_length(btrim(title)) >= 3 and char_length(title) <= 80),
  constraint projects_description_length
    check (description is null or char_length(description) <= 1000),
  constraint projects_cover_url_format
    check (cover_url is null or cover_url ~* '^https?://\S+$')
);

create index projects_owner_id_idx on public.projects (owner_id);

alter table public.projects enable row level security;

-- Lore entries ------------------------------------------------------------

create table public.lore_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  category text not null,
  description text not null,
  image_url text,
  tags text[] not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lore_entries_title_length
    check (char_length(btrim(title)) >= 3 and char_length(title) <= 100),
  constraint lore_entries_category_valid check (category in (
    'character', 'location', 'faction', 'history', 'religion', 'politics',
    'culture', 'technology', 'artifact', 'creature', 'event', 'other'
  )),
  constraint lore_entries_description_length
    check (char_length(description) between 20 and 5000),
  constraint lore_entries_image_url_format
    check (image_url is null or image_url ~* '^https?://\S+$'),
  constraint lore_entries_tags_count check (cardinality(tags) <= 10),
  constraint lore_entries_tags_valid check (public.tags_are_valid(tags))
);

create index lore_entries_author_id_idx on public.lore_entries (author_id);
create index lore_entries_project_id_idx on public.lore_entries (project_id);
create index lore_entries_created_at_idx on public.lore_entries (created_at desc);

alter table public.lore_entries enable row level security;

-- Appreciations -----------------------------------------------------------

create table public.appreciations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lore_id uuid not null references public.lore_entries (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint appreciations_user_lore_key unique (user_id, lore_id)
);

create index appreciations_lore_id_idx on public.appreciations (lore_id);

alter table public.appreciations enable row level security;

-- Constellation saves -----------------------------------------------------

create table public.constellation_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lore_id uuid not null references public.lore_entries (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint constellation_saves_user_lore_key unique (user_id, lore_id)
);

create index constellation_saves_lore_id_idx on public.constellation_saves (lore_id);

alter table public.constellation_saves enable row level security;

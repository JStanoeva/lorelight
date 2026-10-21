-- 007: Creator profile avatar link and star colour

-- Avatar and star colour ------------------------------------------------------
-- avatar_url is an optional http(s) image link, checked like the Project cover
-- and the Lore image. Without it (or when it fails to load) the profile shows a
-- generated placeholder. star_color is one of six fixed accent colours; existing
-- profiles get the default.

alter table public.profiles
  add column avatar_url text,
  add column star_color text not null default 'gold',
  add constraint profiles_avatar_url_format
    check (avatar_url is null or avatar_url ~* '^https?://\S+$'),
  add constraint profiles_star_color_valid check (star_color in (
    'gold', 'violet', 'teal', 'rose', 'blue', 'silver'
  ));

-- Users already update their own row (policy in 002_rls.sql); this only adds
-- the two new columns to what they may change.
grant update (avatar_url, star_color) on public.profiles to authenticated;

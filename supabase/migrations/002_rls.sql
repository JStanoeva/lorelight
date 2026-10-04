-- 002: Privileges, the visibility helper and Row Level Security policies

-- Privileges --------------------------------------------------------------
-- Supabase grants every privilege on new tables to the API roles by default.
-- Replace that with only what the app needs: guests (anon) can only read, and
-- columns that must never change (ids, owners, usernames, timestamps) are left
-- out of the update grants. RLS policies below then decide which rows.

revoke all on public.profiles, public.projects, public.lore_entries,
  public.appreciations, public.constellation_saves
  from anon, authenticated;

grant select on public.profiles, public.projects, public.lore_entries,
  public.appreciations, public.constellation_saves
  to anon, authenticated;

grant update (display_name, bio) on public.profiles to authenticated;

grant insert, delete on public.projects to authenticated;
grant update (title, description, cover_url, is_public) on public.projects to authenticated;

grant insert, delete on public.lore_entries to authenticated;
grant update (project_id, title, category, description, image_url, tags, is_public)
  on public.lore_entries to authenticated;

grant insert, delete on public.appreciations, public.constellation_saves to authenticated;

-- Visibility helper -------------------------------------------------------
-- A Lore Entry is effectively public when both it and its Project are public.
-- security definer: it must see the Project even when the caller can't.

create function public.is_lore_public(lore_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from lore_entries l
    join projects p on p.id = l.project_id
    where l.id = is_lore_public.lore_id
      and l.is_public
      and p.is_public
  );
$$;

-- Profiles ----------------------------------------------------------------
-- Rows are created only by the handle_new_user trigger (003_triggers.sql).

create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Projects ----------------------------------------------------------------

create policy "Public projects and own projects are readable"
  on public.projects for select
  to anon, authenticated
  using (is_public or (select auth.uid()) = owner_id);

create policy "Users can create their own projects"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their projects"
  on public.projects for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their projects"
  on public.projects for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Lore entries ------------------------------------------------------------

create policy "Effectively public lore and own lore are readable"
  on public.lore_entries for select
  to anon, authenticated
  using ((select auth.uid()) = author_id or public.is_lore_public(id));

create policy "Users can create lore in their own projects"
  on public.lore_entries for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  );

-- The with check also covers moving an entry: the new project_id must be
-- another Project owned by the author.
create policy "Authors can update their lore"
  on public.lore_entries for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  );

create policy "Authors can delete their lore"
  on public.lore_entries for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- Appreciations -----------------------------------------------------------

create policy "Appreciations are readable for public lore, own rows and own lore"
  on public.appreciations for select
  to anon, authenticated
  using (
    public.is_lore_public(lore_id)
    or (select auth.uid()) = user_id
    or exists (
      select 1 from public.lore_entries l
      where l.id = lore_id and l.author_id = (select auth.uid())
    )
  );

create policy "Users can appreciate public lore"
  on public.appreciations for insert
  to authenticated
  with check ((select auth.uid()) = user_id and public.is_lore_public(lore_id));

create policy "Users can remove their own appreciations"
  on public.appreciations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Constellation saves -----------------------------------------------------
-- Constellations are public. They never expose private lore, because saves of
-- lore that stops being public are deleted by a trigger (003_triggers.sql).

create policy "Constellation saves are publicly readable"
  on public.constellation_saves for select
  to anon, authenticated
  using (true);

create policy "Users can save public lore to their constellation"
  on public.constellation_saves for insert
  to authenticated
  with check ((select auth.uid()) = user_id and public.is_lore_public(lore_id));

create policy "Users can remove their own constellation saves"
  on public.constellation_saves for delete
  to authenticated
  using ((select auth.uid()) = user_id);

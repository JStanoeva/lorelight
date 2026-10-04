-- 003: Triggers

-- updated_at ---------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger lore_entries_set_updated_at
  before update on public.lore_entries
  for each row execute function public.set_updated_at();

-- Profile on sign-up ---------------------------------------------------------
-- The app signs up with options.data.username. The display name starts as the
-- username. A missing or invalid username fails the profiles check constraint,
-- which cancels the sign-up.
-- security definer: the new user has no session yet, so RLS would block the insert.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    lower(new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Constellation cleanup -----------------------------------------------------
-- When a Lore Entry stops being effectively public, remove it from every
-- Constellation. Appreciations are kept (RLS hides them while the entry is private).
-- security definer: the change deletes other users' saves, which RLS would block.

-- The entry itself turned private or was moved into a private Project.
create function public.remove_saves_of_hidden_lore()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_lore_public(new.id) then
    delete from constellation_saves where lore_id = new.id;
  end if;
  return null;
end;
$$;

create trigger lore_entries_remove_hidden_saves
  after update of is_public, project_id on public.lore_entries
  for each row execute function public.remove_saves_of_hidden_lore();

-- The Project turned private, which hides all of its Lore.
create function public.remove_saves_of_hidden_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_public and not new.is_public then
    delete from constellation_saves
    where lore_id in (select id from lore_entries where project_id = new.id);
  end if;
  return null;
end;
$$;

create trigger projects_remove_hidden_saves
  after update of is_public on public.projects
  for each row execute function public.remove_saves_of_hidden_project();

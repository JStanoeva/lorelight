-- 006: Move a Project's lore to another Project and delete it, in one transaction

-- "Move lore, then delete" used to send two requests: move the entries, then
-- delete the Project. An entry added to the Project between the two (from
-- another tab, for example) was deleted with it. This function does both steps
-- in one transaction, and first locks the Project's row (FOR UPDATE): a
-- concurrent insert or move into it has to wait for that lock (its foreign key
-- check needs the row), and once the Project is gone it fails instead of
-- losing the entry. If any step fails, nothing changes.
--
-- security invoker: it runs with the caller's rights, so RLS and the table
-- privileges still decide what may be moved and deleted.
--
-- Returns true when the Project was deleted, false when it doesn't exist or
-- isn't the caller's (like a delete that matched no rows).
create function public.move_lore_and_delete_project(
  source_project_id uuid,
  target_project_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if source_project_id = target_project_id then
    raise exception 'Choose a different project to move the lore to.'
      using errcode = '22023';
  end if;

  perform 1
  from public.projects
  where id = source_project_id and owner_id = (select auth.uid())
  for update;

  if not found then
    return false;
  end if;

  if not exists (
    select 1 from public.projects
    where id = target_project_id and owner_id = (select auth.uid())
  ) then
    raise exception 'The project to move the lore to is not yours or no longer exists.'
      using errcode = '42501';
  end if;

  -- The clear_folder_on_project_change trigger takes the entries out of their
  -- folders, which are deleted with the Project.
  update public.lore_entries
  set project_id = target_project_id
  where project_id = source_project_id;

  delete from public.projects
  where id = source_project_id;

  return true;
end;
$$;

-- Functions in the public schema are executable by everyone by default (see
-- 004). Only logged-in users need this one.
revoke execute on function public.move_lore_and_delete_project(uuid, uuid) from public, anon;
grant execute on function public.move_lore_and_delete_project(uuid, uuid) to authenticated;

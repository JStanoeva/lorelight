-- 005: Project genre and format, lore folders, and image uploads

-- Project genre and format ----------------------------------------------------
-- One optional genre and one required format per Project. format has no
-- default: it was added before any Project existed.

alter table public.projects
  add column genre text,
  add column format text not null,
  add constraint projects_genre_valid check (genre is null or genre in (
    'fantasy', 'science_fiction', 'romantasy', 'urban_fantasy', 'contemporary',
    'horror', 'mystery_thriller', 'historical_fiction', 'romance', 'dystopian',
    'other'
  )),
  add constraint projects_format_valid check (format in (
    'novel', 'novella', 'short_story_collection', 'worldbuilding', 'tabletop_rpg',
    'video_game', 'comic', 'screenplay', 'other'
  ));

grant update (genre, format) on public.projects to authenticated;

-- Lore folders ----------------------------------------------------------------
-- One level of folders inside a Project. Folder names are unique per Project,
-- ignoring letter case and surrounding spaces.

create table public.lore_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lore_folders_name_length
    check (char_length(btrim(name)) >= 1 and char_length(name) <= 50),
  -- Target of the composite foreign key on lore_entries below.
  constraint lore_folders_id_project_key unique (id, project_id)
);

create unique index lore_folders_project_name_key
  on public.lore_folders (project_id, lower(btrim(name)));

alter table public.lore_folders enable row level security;

create trigger lore_folders_set_updated_at
  before update on public.lore_folders
  for each row execute function public.set_updated_at();

-- An entry can be in a folder of its own Project only: the foreign key covers
-- both columns. Deleting a folder clears folder_id and keeps the entries.
alter table public.lore_entries
  add column folder_id uuid,
  add constraint lore_entries_folder_fkey
    foreign key (folder_id, project_id)
    references public.lore_folders (id, project_id)
    on delete set null (folder_id);

create index lore_entries_folder_id_idx on public.lore_entries (folder_id, project_id);

-- Moving an entry to another Project takes it out of its old folder, unless the
-- same update also picks a folder of the new Project.
create function public.clear_folder_on_project_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_id is distinct from old.project_id
    and new.folder_id is not distinct from old.folder_id then
    new.folder_id = null;
  end if;
  return new;
end;
$$;

create trigger lore_entries_clear_folder_on_project_change
  before update of project_id on public.lore_entries
  for each row execute function public.clear_folder_on_project_change();

-- Privileges: same pattern as 002_rls.sql. A folder can be renamed, but never
-- moved to another Project.
revoke all on public.lore_folders from anon, authenticated;
grant select on public.lore_folders to anon, authenticated;
grant insert, delete on public.lore_folders to authenticated;
grant update (name) on public.lore_folders to authenticated;

grant update (folder_id) on public.lore_entries to authenticated;

-- The owner sees all folders of their Projects. Everyone else sees a folder
-- only while it holds at least one effectively public entry, so the names of
-- folders with only private lore stay private.
create policy "Folders are readable by owners or when holding public lore"
  on public.lore_folders for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.lore_entries l
      where l.folder_id = lore_folders.id and public.is_lore_public(l.id)
    )
  );

create policy "Owners can create folders in their projects"
  on public.lore_folders for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  );

create policy "Owners can rename their folders"
  on public.lore_folders for update
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their folders"
  on public.lore_folders for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  );

-- Image uploads ---------------------------------------------------------------
-- A public bucket for Project covers and Lore images: anyone can open an image
-- by its URL. Storage itself rejects other file types and files over 2 MB.
-- Each user writes only inside a folder named after their user id
-- ({user id}/{file name}). Nobody can list other users' files.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Users can upload images into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Deleting through the Storage API also needs read access to the file.
create policy "Users can read their own images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

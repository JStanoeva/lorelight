// Mirrors the projects_format_valid check constraint (supabase/migrations/005_genres_folders_images.sql), same order.
// A Project's format is required.
export const PROJECT_FORMATS = [
  { value: "novel", label: "Novel / Novel Series" },
  { value: "novella", label: "Novella" },
  { value: "short_story_collection", label: "Short Story Collection" },
  { value: "worldbuilding", label: "Worldbuilding / Setting" },
  { value: "tabletop_rpg", label: "Tabletop RPG" },
  { value: "video_game", label: "Video Game" },
  { value: "comic", label: "Comic / Graphic Novel" },
  { value: "screenplay", label: "Screenplay" },
  { value: "other", label: "Other" },
];

// Mirrors the projects_genre_valid check constraint (supabase/migrations/005_genres_folders_images.sql), same order.
// A Project's genre is optional.
export const PROJECT_GENRES = [
  { value: "fantasy", label: "Fantasy" },
  { value: "science_fiction", label: "Science Fiction" },
  { value: "romantasy", label: "Romantasy" },
  { value: "urban_fantasy", label: "Urban Fantasy" },
  { value: "contemporary", label: "Contemporary" },
  { value: "horror", label: "Horror" },
  { value: "mystery_thriller", label: "Mystery / Thriller" },
  { value: "historical_fiction", label: "Historical Fiction" },
  { value: "romance", label: "Romance" },
  { value: "dystopian", label: "Dystopian / Post-Apocalyptic" },
  { value: "other", label: "Other" },
];

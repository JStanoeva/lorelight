# Lorelight

Lorelight is a worldbuilding platform for writing, organizing and sharing fictional lore.

**Live app:** https://lorelight.vercel.app

---

## Features

Writers, game masters and worldbuilders often keep the notes for their fictional worlds scattered across many files. Lorelight gives that lore one home.

- **Projects for your worlds:** each Project has a format (such as a novel, a tabletop RPG or a video game), an optional genre, and a cover image or a generated one. Folders keep its lore in order.
- **Lore Entries:** write about characters, locations, factions, artifacts and more, in 12 categories, with tags and an optional image link.
- **Private until you share it:** new Projects and entries start private. An entry is public only when both the entry and its Project are public.
- **Lore Catalog:** browse everyone's public lore, search by title, description or tag, filter by category and sort by date.
- **Appreciate and save:** appreciate the entries you love and pin them to your Constellation, a personal pin board where dotted lines join entries of the same category.
- **Creator profiles:** every creator has a profile with stats, a creator title, a star colour and tabs for their Projects, lore, Constellation and appreciated lore.

Anyone can browse the catalog, public Projects and profiles. Creating, appreciating and saving need an account, and you can register on the live app.

---

## Getting Started

The quickest way to try Lorelight is the live app above. To run it on your own computer, follow these steps.

### Prerequisites

- Node.js 22.22 or newer
- npm
- Your own Supabase project (a free one is enough). This repository doesn't include any keys.

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/JStanoeva/lorelight.git
   cd lorelight
   ```

2. Install packages

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root (copy `.env.example` and fill in your own values)

   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Copy the Project URL and the anon (or publishable) key from your Supabase dashboard. The app doesn't start without this file.

4. Set up your Supabase project

   - In the Supabase SQL Editor, run the 7 files in `supabase/migrations/` one after another, from `001` to `007`. They create the whole database: tables, rules, triggers, security policies and the image storage bucket.
   - In the Authentication settings, open the Email sign-in provider and turn off **Confirm email**, so new accounts are logged in right after registering.
   - Create accounts through the app's Register page. Accounts can't be added from the Supabase dashboard, because every profile needs a username.
   - A new database starts empty, so add your own projects and lore through the app.

5. Start the development server

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173`.

### Available Scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Starts the development server           |
| `npm run build`   | Creates the production build in `dist/` |
| `npm run preview` | Serves the production build locally     |
| `npm run lint`    | Checks the code with ESLint             |
| `npm test`        | Runs the unit tests once with Vitest    |

---

## Architecture

### Tech Stack

- **Frontend:** React 19, JavaScript, Vite, React Router 8 (declarative routes in `App.jsx`)
- **Styling:** Tailwind CSS 4 and external CSS files
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security), used through the Supabase JavaScript client
- **Deployment:** Vercel (frontend), Supabase (backend)
- **Testing:** Vitest (unit tests for the validation rules and other helper functions)

### Folder Structure

The code is organized by feature: each feature folder holds the code for one part of the app.

```
src/
├── app/            # App.jsx (all routes, wrapped in AuthProvider), layout (header, footer), Home and Not Found pages
├── features/
│   ├── auth/           # AuthContext, route guards, Login and Register, auth service
│   ├── home/           # Home page sections and their animations (no data)
│   ├── lore/           # catalog, details, lore forms, lore service
│   ├── projects/       # project pages, sidebar, folders, project service
│   ├── constellation/  # Save button and My Constellation
│   ├── appreciation/   # Appreciate button, hook and service
│   └── profile/        # Creator Profile and Edit Profile
├── shared/         # shared components, hooks, utilities, constants and styles
├── lib/            # Supabase client
├── styles/         # shared component classes (components.css)
├── index.css       # Tailwind, theme colours and fonts, base styles
└── main.jsx        # entry point
```

A feature folder can have:

- `pages/`: routed pages
- `components/`: UI pieces
- `hooks/`: React logic and data loading
- `services/`: all Supabase calls
- `context/`: React Context (in `auth` and `home`)
- `guards/`: route guards (in `auth`)
- `styles/`: the feature's CSS files
- `shaders/`: the code that draws the Home page's animated sky (in `home`)
- `utils/`, `constants/`: helpers and fixed values

Unit tests sit next to the file they test and end in `.test.js` (for example `src/features/lore/utils/tags.test.js`). They check plain helper functions, such as the validation rules, without a browser or Supabase.

`lore/` is its own feature next to `projects/` because lore also appears in the catalog, the Constellation and profiles. `shared/` never imports from `features/`.

### Data Flow

```
Page (or its layout route) → custom hook → service → Supabase
```

Example: `/lore/:entryId` → `ProjectWorkspaceLayout` (the layout route around `LoreDetailsPage`) → `useLoreEntry(entryId)` → `loreService.getLoreById()` → Supabase. `LoreDetailsPage` then gets the entry through `useOutletContext()`.

Changes skip the hook: the page or component calls the service directly (for example `CreateLorePage` → `loreService.createLore()` → Supabase).

Services contain no React code, and pages contain no Supabase code.

### Data Model

| Table                 | Purpose                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `profiles`            | Public user info (unique username, display name, bio, avatar link, star colour), created on sign-up |
| `projects`            | Collections of lore owned by a user, each with a format and an optional genre                       |
| `lore_folders`        | Optional folders that organize the lore inside one project (one level)                              |
| `lore_entries`        | Main content; every entry belongs to exactly one project, and optionally to one of its folders      |
| `appreciations`       | One row per user per appreciated entry                                                              |
| `constellation_saves` | One row per user per saved entry                                                                    |

All ids are UUIDs (a profile uses its user's id from Supabase Auth). Pictures (project covers, lore images and avatars) are saved as links. The database also has a storage bucket (`images`) ready for image uploads, which are planned for a later version.

### Security

The database enforces the rules itself (Row Level Security policies, column privileges, foreign keys and triggers), not only the UI:

- A Lore Entry is public only when both the entry and its Project are public. Owners can also read their own private rows.
- Only the owner can create, change or delete their lore, Projects and folders, and users can change only their own profile. Lore can only go into the author's own Projects, and only into a folder of its own Project.
- Other users see a folder only while it holds public lore.
- Users can add appreciations and saves only for public lore, and can add or remove only their own.
- Saved lore that becomes private is removed from every Constellation automatically.
- Guests can only read, and nobody can change ids, owners, usernames or dates through the API.

The database tables, rules, triggers and policies are stored as numbered SQL files in `supabase/migrations/`.

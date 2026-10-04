# Lorelight

Lorelight is a worldbuilding platform for writing, organizing and sharing fictional lore. Creators organize their worlds into Projects, write Lore Entries (characters, locations, factions, artifacts and more) inside them, choose what stays private and what gets published, and discover other creators' public lore.

**Live app:** https://YOUR-DEPLOY-URL.vercel.app

**Demo account:** `demo@lorelight.app` / `YOUR-DEMO-PASSWORD`

---

## Getting Started

### Prerequisites

- Node.js 20.19 or newer
- npm
- A Supabase project (URL + anon key)

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

4. Set up the database (only needed when using your own Supabase project)

   Run the SQL files from `supabase/migrations/` in the Supabase SQL Editor, in the order of their numbers. They create all tables, constraints, triggers and Row Level Security policies. Optionally run `supabase/seed.sql` afterwards to add demo content.

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

---

# Functional Guide

## 1. Project Overview

**Application Name:** Lorelight

**Application Category / Topic:** Worldbuilding platform (content creation and sharing)

**Main Purpose:**
Lorelight gives writers, game masters and worldbuilders one place to keep the lore of their fictional worlds. Users create Projects for their worlds, write Lore Entries inside them, and decide what is private or public, either per entry or for a whole Project. Public lore appears in a searchable catalog, where other users can appreciate (like) entries and save them to their personal Constellation (pin board) for inspiration.

---

## 2. User Access & Permissions

### Guest (Not Authenticated)

- **Available pages / routes:** Home (`/`), Lore Catalog (`/lore`), Lore Details (`/lore/:entryId`), Project Details (`/projects/:projectId`), Creator Profile (`/profile/:userId`), Login (`/login`), Register (`/register`)
- **Public data shown:** public Lore Entries in public Projects (title, category, description, tags, author, project, appreciation count), public Projects with their public lore, creator profiles (display name, `@username`, bio, public Projects and lore, and the creator's Constellation of saved inspiration)
- Guests can see appreciation counts, but the Appreciate and Save buttons prompt them to log in.

### Authenticated User

- **Main sections / pages:** Lore Catalog, My Projects (`/projects`), My Constellation (`/constellation`), Create Lore (`/lore/create`), Create Project (`/projects/create`), own profile and Edit Profile (`/profile/edit`)
- **Details pages:** Lore Details and Project Details, including the user's own private entries and projects
- **Create / Edit / Delete actions:**
  - Create, edit and delete **their own** Lore Entries and Projects
  - Appreciate and remove appreciation from public Lore Entries (including their own)
  - Save and remove public Lore Entries from their Constellation
  - Edit their own display name and bio
  - Edit and Delete buttons are shown only to the author, and Supabase Row Level Security rejects modification attempts from anyone else

---

## 3. Authentication & Session Handling

### Authentication Flow

1. **App load:** `AuthContext` subscribes to Supabase's `onAuthStateChange`, whose first event delivers the stored session. Until it arrives, `isAuthLoading` is `true` and the route guards show a loader instead of redirecting.
2. **Status check:** once the session is known, `AuthContext` exposes the current `user` (or `null`) to the whole app. The same listener keeps running, so every login, logout or token refresh updates the app automatically.
3. **Successful login / registration:** Supabase returns a session, the context updates, the header switches to the logged-in navigation, and `GuestGuard` redirects the user to the page they originally tried to open (or to `/lore`). On registration, the form first checks that the username is still available; after sign-up, a database trigger creates the user's `profiles` row with that username and uses it as the initial display name.
4. **Logout:** the user is first sent to the home page, then the Supabase session is cleared and the context resets `user` to `null`.

### Session Persistence

- **Storage:** the Supabase client stores the session in `localStorage`. `AuthContext` holds the current user in React state and shares it through Context.
- **Automatic login after refresh:** on page load, `AuthContext` restores the session from storage through Supabase, so the user stays logged in without re-entering credentials.

---

## 4. Routing Structure

### Route Guards Logic

- **`AuthGuard`** (layout route): wraps all private routes. Guests are redirected to `/login`, and the original location is remembered for the redirect after login.
- **`GuestGuard`** (layout route): wraps `/login` and `/register`. Logged-in users are redirected to the page they originally wanted, or to `/lore`.
- **`OwnerGuard`** (component): used inside the edit pages after the record has loaded. If the current user is not the owner, they are redirected to the record's details page.

### Main Routes

| Route                       | Page             | Access        |
| --------------------------- | ---------------- | ------------- |
| `/`                         | Home             | Public        |
| `/lore`                     | Lore Catalog     | Public        |
| `/lore/:entryId`            | Lore Details     | Public        |
| `/projects/:projectId`      | Project Details  | Public        |
| `/profile/:userId`          | Creator Profile  | Public        |
| `/lore/create`              | Create Lore      | Authenticated |
| `/lore/:entryId/edit`       | Edit Lore        | Author only   |
| `/projects`                 | My Projects      | Authenticated |
| `/projects/create`          | Create Project   | Authenticated |
| `/projects/:projectId/edit` | Edit Project     | Author only   |
| `/constellation`            | My Constellation | Authenticated |
| `/profile/edit`             | Edit Profile     | Authenticated |
| `/login`                    | Login            | Guest only    |
| `/register`                 | Register         | Guest only    |
| `*`                         | Not Found        | Public        |

That is 15 routes: 5 public pages, 7 pages for logged-in users (2 of them author-only), 2 guest-only pages and a Not Found fallback. The dynamic pages (loading data from the backend) are the Lore Catalog, Lore Details, Project Details, Creator Profile, My Projects and My Constellation.

### Nested & Parameterized Routes

- **Nested routing:** yes. All routes render inside `MainLayout` (header, `<Outlet />`, footer). `AuthGuard` and `GuestGuard` are layout routes whose child routes render through `<Outlet />`.
- **URL parameters:** `/lore/:entryId`, `/lore/:entryId/edit`, `/projects/:projectId`, `/projects/:projectId/edit`, `/profile/:userId`
- **Search parameters:** the catalog stores search, category and sort in the URL (e.g. `/lore?q=dragon&category=creature&sort=newest`).

---

## 5. List → Details Flow

### Catalog / List Page

- **Data displayed:** a grid of public Lore Entries from public Projects, showing title, category, a short description excerpt, tags, author (display name) and appreciation count.
- **Interaction:**
  - **Search** by title, description, or an exact tag
  - **Filter** by category
  - **Sort** by newest or oldest
  - Filters are kept in the URL, so a filtered view survives refresh and can be shared.

### Details Page

- **Navigation:** each Lore Card is a `<Link>` to `/lore/:entryId`. After creating or editing an entry, `useNavigate` redirects to its details page.
- **Route parameter data:** `entryId` is read with `useParams` and passed to the `useLoreEntry(entryId)` hook, which loads the entry together with its author and project. Missing and private entries, and ids that aren't valid, show a "not found" state.

---

## 6. Data Source & Backend

### Backend Type

- **Supabase**: hosted PostgreSQL database, Supabase Auth, and Row Level Security.
- The backend is always reachable and all data persists between visits.
- The frontend is a production build deployed on Vercel.

---

## 7. Data Operations (CRUD)

The main CRUD collection is **Lore Entries** (`lore_entries`). Projects (`projects`) support full CRUD as well.

### Create (POST)

Logged-in users open **Create Lore** from the header or with the "Add Lore" button on one of their Projects (which pre-selects that Project). Every entry belongs to a Project, so the form collects the Project (required), title, category, description, tags, an optional image URL and a public/private setting. Users without any Projects see a prompt to create one first. On submit, `loreService.createLore()` inserts the row with the current user as `author_id`, and the user is redirected to the new entry's details page.

### Read (GET)

- **Catalog:** `useLoreList(filters)` → `loreService.getPublicLore()` loads public entries with the active search, category and sort.
- **Details:** `useLoreEntry(entryId)` → `loreService.getLoreById()`
- **Project Details:** loads the project and its lore entries.
- **Profile:** loads a creator's Projects, Lore and Constellation (only public items for visitors; everything for the owner).
- **My Constellation:** loads the current user's saved entries.

### Update (PUT/PATCH)

- **How the author edits:** the Edit button on the details page (visible only to the author) opens `/lore/:entryId/edit`. The form is pre-filled with the current values, and `loreService.updateLore()` saves the changes. Changing the Project selector moves the entry to another of the user's Projects.
- **UI update:** after a successful update, the user is redirected to the details page, which loads the updated entry.

### Delete

- **How the author deletes:** the Delete button (visible only to the author) opens a confirmation dialog. After confirming, `loreService.deleteLore()` removes the entry. Its appreciations and Constellation saves are deleted automatically by the database.
- **UI update:** the user is redirected to the details page of the Project the entry belonged to, where the deleted entry no longer appears.

Deleting a **Project** opens a dialog with two choices:

- **Delete with its lore:** the Project is deleted, and the database removes its Lore Entries (and their appreciations and Constellation saves) automatically.
- **Move lore, then delete:** all entries are first moved to another Project the user chooses, then the empty Project is deleted. This option only appears when the user owns another Project.

**Projects** follow the same pattern: after creating or editing a Project, the user lands on its details page; after deleting it, on My Projects.

Making a **Project private** hides all of its Lore Entries from everyone else, without changing each entry's own public/private setting. Making the Project public again restores them.

---

## 8. Forms & Validation

### Forms Used

- Register
- Login
- Create / Edit Lore Entry
- Create / Edit Project
- Edit Profile
- Delete Project dialog (delete lore or move it to another Project)
- Catalog search and filters

All forms use controlled inputs (`value` + `onChange`) and submit through the `onSubmit` synthetic event.

### Validation Rules

- **Lore title:** required; 3–100 characters; leading and trailing spaces are removed.
- **Lore category:** required; must be one of the predefined categories.
- **Lore project:** required; must be one of the user's own Projects.
- **Lore description** (multiple rules): required; at least 20 characters; at most 5,000 characters.
- **Tags:** optional; up to 10 tags; each tag up to 30 characters; stored in lowercase; duplicates are removed.
- **Image / cover URL:** optional; if filled in, must be a valid `http(s)` URL.
- **Project title:** required; 3–80 characters. **Project description:** optional; up to 1,000 characters.
- **Username** (register, multiple rules): required; 3–30 characters; letters and numbers only (no spaces or special characters); must not already be taken (case-insensitive).
- **Display name** (edit profile): required; 1–50 characters; any characters allowed. **Bio:** optional; up to 500 characters.
- **Email:** required; valid email format.
- **Password** (register, multiple rules): required; at least 8 characters; at least one uppercase letter, one lowercase letter, one number and one special character; must match the Repeat Password field. A checklist under the field shows all rules from the start and marks each one as met while the user types.

The same length limits are enforced by database check constraints, so invalid data is rejected even if the form is bypassed.

Invalid fields show a message under the input. The submit button is disabled while a request is in progress, and server errors are shown above the form.

---

## 9. React-Specific Techniques

### Hooks & Component Lifecycle

- **Hooks used:**
  - `useState` — form fields, loading and error states, UI toggles
  - `useEffect` — data fetching, auth subscription
  - `useContext` — reading `AuthContext` through the `useAuth` hook
  - `useCallback` — a stable `refetch` function returned by the data hooks
  - `useParams`, `useNavigate`, `useSearchParams`, `useLocation` — routing
  - Custom hooks — `useAuth`, `useLoreList`, `useLoreEntry`, `useProjects`
- **Mount / update / unmount example:**
  - **Mount:** `AuthContext` subscribes to `onAuthStateChange`; the first event delivers the stored session.
  - **Update:** `useLoreList` refetches whenever the search, category or sort parameters in the URL change, while the Catalog page stays mounted. `useLoreEntry(entryId)` likewise refetches when `entryId` changes, e.g. when the browser's Back button returns from one entry's details page to another.
  - **Unmount:** `AuthContext` unsubscribes from the auth listener in its effect cleanup. Data hooks mark in-flight requests as stale in their cleanup, so a late response never updates an unmounted component.

### Context API

- **`AuthContext`** shares the current user, `isAuthLoading`, and the `login`, `register` and `logout` actions.
- **Consumers:** Header (navigation and logout), `AuthGuard`, `GuestGuard`, `OwnerGuard`, Login and Register pages, Lore/Project forms (author id), and the appreciation and Constellation buttons.

### Component Styling

- **How components are styled:** _To be completed once styling is implemented: the styling approach and the external CSS files used (at least two)._

---

## 10. Typical User Flow

1. A guest opens Lorelight, browses the Lore Catalog, filters by category and opens an entry's details.
2. The guest tries to appreciate the entry, is prompted to log in, and registers a new account.
3. The new user creates a Project for their world and adds a private Lore Entry to it.
4. When the entry is ready, the user edits it and makes it public, so it appears in the catalog.
5. Another user finds the entry, appreciates it, and saves it to their Constellation.
6. The author later edits the entry, moves it to another project, or deletes it, then logs out.

---

## 11. Error & Edge Case Handling

- **Authentication errors:** wrong credentials, already registered emails and taken usernames show a readable message on the form. Guests opening private routes are redirected to login, and logged-in users are redirected away from login and register.
- **Network or data errors:** every data-loading page shows a loading state, and failed requests show an error message with a retry button instead of crashing. Failed mutations show an error and keep the form data, so nothing is lost.
- **Empty or missing data states:**
  - The catalog, projects and Constellation show a friendly empty state with a call to action.
  - Searches without results suggest clearing the filters.
  - Missing or private records (including anything inside a private Project) show a "not found" state.
  - If a saved entry becomes private, it is removed from every Constellation automatically, so no one sees a broken card.
  - Unknown URLs show the Not Found page.

---

## Architecture

### Tech Stack

- **Frontend:** React, JavaScript, Vite, React Router
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Deployment:** Vercel (frontend), Supabase (backend)

### Folder Structure

The project uses a feature-first structure: each domain owns its pages, components, hooks and services.

```
src/
├── app/            # App component, router, global providers
├── features/
│   ├── auth/           # AuthContext, login/register, auth service
│   ├── lore/           # catalog, details, lore forms, lore service
│   ├── projects/       # project pages, forms, project service
│   ├── constellation/  # saved lore
│   ├── appreciation/   # appreciate button and service
│   └── profile/        # creator profiles
├── shared/         # layout, header, footer, guards, shared UI and hooks
├── lib/            # Supabase client
└── main.jsx
```

Folders follow code topics, not the data hierarchy: every Lore Entry belongs to a Project, but `lore/` is a sibling of `projects/` because Lore is also shown in the Catalog, Constellation and Profiles. Closely related features (like `lore` and `projects`) import each other's components, hooks and services, without file-level import cycles; `shared/` never imports from `features/`.

Inside each feature:

- `pages/` — routed screens
- `components/` — reusable UI
- `hooks/` — React logic and data fetching
- `services/` — all Supabase communication
- `utils/`, `constants/` — pure helpers and fixed values

### Data Flow

```
Page → custom hook → service → Supabase → service → hook → page/components
```

Example: `/lore/:entryId` → `LoreDetailsPage` → `useLoreEntry(entryId)` → `loreService.getLoreById()` → Supabase.

Services contain no React code, and pages contain no Supabase code.

### Data Model

| Table                 | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `profiles`            | Public user info (unique username, display name, bio), created on sign-up |
| `projects`            | Collections of lore owned by a user                                       |
| `lore_entries`        | Main content; every entry belongs to exactly one project                  |
| `appreciations`       | One row per user per appreciated entry                                    |
| `constellation_saves` | One row per user per saved entry                                          |

All ids are UUIDs generated by the database.

### Security

Authorization is enforced in the database with Row Level Security, not only in the UI:

- A Lore Entry is public only when both the entry and its Project are public. Owners can also read their own private rows.
- Only the owner can create, update or delete their lore and projects, and lore can only be written into the author's own Projects.
- Users can only add or remove their own appreciations and Constellation saves, and only for public lore. Constellations are publicly visible on creator profiles; saved lore that becomes private is removed from them automatically.
- Table privileges add a second layer under RLS: guests can only read, and ids, owners, usernames and timestamps can't be changed through the API.
- Check constraints mirror the form validation rules (lengths, categories, tags, username format), so invalid data is rejected even if the frontend is bypassed.

The database schema, constraints, triggers and policies are stored as numbered SQL files in `supabase/migrations/`, with demo content in `supabase/seed.sql`.

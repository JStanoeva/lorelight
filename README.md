# Lorelight

Lorelight is a worldbuilding platform for writing, organizing and sharing fictional lore.

**Live app:** https://lorelight.vercel.app

**Demo account:** Email: `demo@lorelight.app` / Password: `Abc123!?`

You can also register your own account on the live app.

---

## Getting Started

The quickest way to review Lorelight is the live app above. To run it on your own computer, follow these steps.

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
   - A new database starts empty, so add your own projects and lore through the app. The live app already has demo content to explore.

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

# Functional Guide

## 1. Project Overview

**Application Name:** Lorelight

**Application Category / Topic:** Worldbuilding platform (content creation and sharing)

**Main Purpose:**
Worldbuilders often keep the notes for their fictional worlds scattered across many files. Lorelight gives writers, game masters and worldbuilders one place for this lore. Users create Projects for their worlds, write Lore Entries inside them, and decide what is private and what is public. Public lore appears in a searchable catalog, where other users can appreciate (like) entries and save them to their Constellation, a personal pin board.

---

## 2. User Access & Permissions

### Guest (Not Authenticated)

- **Available pages / routes:** Home (`/`), Lore Catalog (`/lore`), Lore Details (`/lore/:entryId`), Project Details (`/projects/:projectId`), Creator Profile (`/profile/:userId`), Creator's Collection (`/profile/:userId/:collection`), Login (`/login`), Register (`/register`)
- **Public data shown:**
  - public Lore Entries in public Projects (title, category, description, tags, author, Project and appreciation count)
  - public Projects with their public lore
  - creator profiles: avatar, display name, `@username`, bio, stats, public Projects and lore, the creator's Constellation and the public lore they appreciated
- Guests can't create, edit, delete, appreciate or save. If they click Appreciate or Save, or open a private page, they go to the Login page.

### Authenticated User

- **Main sections / pages:** Lore Catalog, My Projects (`/projects`), My Constellation (`/constellation`), Create Lore (`/lore/create`), Create Project (`/projects/create`), Edit Lore and Edit Project (author only), their own Creator Profile and Edit Profile (`/profile/edit`)
- **Details pages:** Lore Details and Project Details, including the user's own private entries and Projects
- **Create / Edit / Delete actions:**
  - Create, edit and delete **their own** Lore Entries, Projects and folders
  - Appreciate public Lore Entries (their own too) and remove the appreciation
  - Save public Lore Entries to their Constellation and remove them
  - Edit their own profile: display name, bio, avatar link and star colour
  - Only the author sees the Edit and Delete buttons, and the database blocks changes from anyone else.

---

## 3. Authentication & Session Handling

### Authentication Flow

1. **What happens when the app loads:** `AuthProvider` starts listening to Supabase's login changes (`onAuthStateChange`). The first answer is the saved session, or none. Until it arrives, `isAuthLoading` is `true`, and the route guards show a loader instead of redirecting.
2. **How authentication status is checked:** components read the current `user` (or `null` for a guest) with the `useAuth()` hook. When the user logs in or out, every component that reads it updates.
3. **What happens on successful login or registration:**
   - Supabase returns a session, and the header shows the logged-in links.
   - `GuestGuard` sends the user to the page they wanted, or to `/lore`.
   - Register only: the form first checks that the username is free. After sign-up, the database creates the user's profile with that username.
4. **What happens on logout:** the user is sent to the Home page first. Then the session is cleared in this browser, and `user` becomes `null`.

### Session Persistence

- **How is the user session stored?** The Supabase client keeps the session in `localStorage`. `AuthProvider` keeps the current user in React state and shares it through `AuthContext`.
- **How is automatic login handled after a page refresh?** When the page loads, the Supabase client finds the saved session in `localStorage` and passes it to `AuthProvider`. The user stays logged in without typing their password again.

---

## 4. Routing Structure

All routes are defined in `src/app/App.jsx`. The route guards are in `src/features/auth/guards/`.

### Route Guards Logic

- **How is routing split between guest-only and private routes?**
  - **`AuthGuard`** (layout route) wraps all private routes. Guests are sent to `/login`, and the page they wanted is remembered for after the login.
  - **`GuestGuard`** (layout route) wraps `/login` and `/register`. Logged-in users are sent to the page they wanted, or to `/lore`.
  - **`OwnerGuard`** (component) is used in Edit Lore and Edit Project after the record has loaded. Anyone who isn't the owner is sent to the record's details page. Edit Profile doesn't need it: `/profile/edit` has no id in the URL and always opens the user's own profile.

### Main Routes

- **Number and type of top-level pages:** 16 routes in total. 6 are public pages, 7 are for logged-in users (2 of them author-only), 2 are guest-only, and 1 is the Not Found page.

| Route                          | Page                 | Access        |
| ------------------------------ | -------------------- | ------------- |
| `/`                            | Home                 | Public        |
| `/lore`                        | Lore Catalog         | Public        |
| `/lore/:entryId`               | Lore Details         | Public        |
| `/projects/:projectId`         | Project Details      | Public        |
| `/profile/:userId`             | Creator Profile      | Public        |
| `/profile/:userId/:collection` | Creator's Collection | Public        |
| `/lore/create`                 | Create Lore          | Authenticated |
| `/lore/:entryId/edit`          | Edit Lore            | Author only   |
| `/projects`                    | My Projects          | Authenticated |
| `/projects/create`             | Create Project       | Authenticated |
| `/projects/:projectId/edit`    | Edit Project         | Author only   |
| `/constellation`               | My Constellation     | Authenticated |
| `/profile/edit`                | Edit Profile         | Authenticated |
| `/login`                       | Login                | Guest only    |
| `/register`                    | Register             | Guest only    |
| `*`                            | Not Found            | Public        |

- The main dynamic pages (they load data from the backend) are the Lore Catalog, Lore Details, Project Details, Creator Profile, Creator's Collection, My Projects and My Constellation. Create Lore and the three edit pages also load data to fill their forms.
- A Creator's Collection page lists everything in one profile tab. `:collection` is `projects`, `lore`, `constellation` or `appreciated`. Any other value shows the Not Found page.
- The Home page (`/`) is an animated welcome page and loads no data:
  - a welcome banner with two buttons: "Create a world" and "Login" (logged-in users see "Explore the lore" instead of "Login")
  - three short animated examples: Create, Share and Explore
  - the 12 lore categories, each with a link to its lore in the catalog (a slowly turning wheel of stars on large screens, a list on small screens)
  - a FAQ and a final call to action
  - every section fades in, part by part, the first time it comes into view (the welcome banner as the page opens)
  - a "Pause animations" button that stops every animation. With the system's reduced-motion setting, the page shows still pictures instead, and the button is hidden. In both cases, the sections appear without fading in.

### Nested & Parameterized Routes

- **Is there nested routing?** Yes.
  - Every route renders inside `MainLayout` (header, `<Outlet />`, footer).
  - `AuthGuard` and `GuestGuard` are layout routes. Their child routes render through `<Outlet />`.
  - Project Details and Lore Details share one layout route, `ProjectWorkspaceLayout`. It loads the data and shows the Project sidebar, which stays in place when the user moves between the Project and its entries. Both pages read its data with `useOutletContext()`.
- **Which routes use URL parameters?** `/lore/:entryId`, `/lore/:entryId/edit`, `/projects/:projectId`, `/projects/:projectId/edit`, `/profile/:userId`, `/profile/:userId/:collection`
- **Search parameters:**
  - Lore Catalog: search, category and sort (for example `/lore?q=dragon&category=creature&sort=oldest`)
  - My Constellation and a creator's full Constellation page: the category filter (for example `/constellation?category=location`)
  - Creator Profile: the open tab (for example `/profile/:userId?tab=lore`)
  - Create Lore: `/lore/create?projectId=…&folderId=…` pre-selects the Project and the folder
  - Filters and tabs in the URL survive a refresh and can be shared.

---

## 5. List → Details Flow

### Catalog / List Page

- **What data is displayed?** The Lore Catalog (`/lore`) shows a grid of cards for public Lore Entries in public Projects. Each card shows the entry's image (or a generated picture), the category, title, Project, a short part of the description, up to three tags, the author and the appreciation count.
- **How does the user interact with the list (filter / sort / search)?**
  - **Search** by title, description or an exact tag
  - **Filter** by category with buttons (one category, or All)
  - **Sort** by newest first or oldest first
  - The catalog shows up to 100 entries. When it reaches that limit, a note suggests searching or choosing a category.

### Details Page

- **How is navigation triggered (Link / useNavigate)?** Each lore card is a `<Link>` to the Lore Details page (`/lore/:entryId`). After an entry is created or edited, `useNavigate` opens its details page.
- **What data is received via route parameters?** `ProjectWorkspaceLayout` reads `entryId` from the URL with `useParams`. It passes the id to `useLoreEntry(entryId)`, which loads the entry with its author and Project. If the entry doesn't exist or is private, the page shows "Lore not found". Project Details works the same way with `projectId` and `useProject(projectId)`.
- **Page content:**
  - the Project sidebar with its folders and entries
  - the entry: image (or a generated picture with its category's symbol), category, title, author, Project, folder, dates, description and tags
  - for the author: Edit and Delete buttons and a note on who can see the entry
- **Appreciate and Save:** logged-in users can appreciate an entry and save it to their Constellation, and undo both. Guests who click them go to the Login page and come back to the entry afterwards. On the author's entries that others can't see (a private entry, or any entry in a private Project), only the appreciation count is shown, because only public lore can be appreciated or saved.

### My Constellation

- The user's saved entries are shown as cards on a pin board, newest save first. Each card shows the entry's image, category, title, Project, author and save date, and links to the entry.
- Each card has a pin in its category's colour, and dotted lines join cards of the same category.
- Category buttons above the board (All, plus each saved category with its count) filter the cards.
- Each card has a Remove button that takes the entry off the board.

### Creator Profile

- Author names on cards and details pages, and the `@username` link in the header, open `/profile/:userId`. The page reads `userId` with `useParams` and loads everything with `useProfile(userId)`.
- The header shows the avatar (from the avatar link, or a generated picture), display name, `@username`, "Member since" and bio.
- Below them are the stats (Projects, Lore entries, Appreciations received, Saves) and "Currently worldbuilding", a link to the creator's most recently updated public Project.
- A creator title (for example "Keeper of Locations") names the category the creator has written the most public lore in. Each profile also has one of six star colours, which tints the profile's background and accents.
- Tabs: Projects, Lore, Constellation and Appreciated. Each tab shows its three most recent items. When there are more, an "All …" link opens `/profile/:userId/:collection` with every item.
- Visitors see only public items. The owner sees everything, with private items marked, plus an Edit profile button.

---

## 6. Data Source & Backend

### Backend Type

- **Real backend:** Supabase, a Backend-as-a-Service. It provides a hosted PostgreSQL database, user accounts (Supabase Auth) and Row Level Security.
- Supabase hosts the database and the logins, so there is no separate server to deploy. The app talks to Supabase over the internet with its JavaScript client (`@supabase/supabase-js`), which calls Supabase's REST API.
- All projects, lore, profiles, appreciations and saves come from the database. Nothing is hardcoded. The animated previews on the Home page are illustrations with sample text, not app data.
- The Supabase project is on a paid plan, so it never goes to sleep. It is always reachable and keeps all data between visits.
- The frontend is a production build hosted on Vercel.

---

## 7. Data Operations (CRUD)

The main CRUD collection is **Lore Entries** (`lore_entries`). Projects (`projects`) also have full CRUD.

### Create (POST)

- **How does the user create new data?**
  - Logged-in users open Create Lore from:
    - the header ("Create Lore")
    - a Project page ("Add Lore", or New → "New lore entry" in the sidebar)
    - a folder in the sidebar ("New lore entry here")
  - Opening it from a Project or a folder pre-selects it in the form.
  - The form asks for the Project (required), an optional folder, title, category, description, tags, an optional image link and whether the entry is public. Users without a Project are asked to create one first.
  - On submit, `loreService.createLore()` saves the entry with the user as its author, and the user lands on the new entry's details page.
  - New Projects and Lore Entries are private until the owner makes them public.

### Read (GET)

- **Where is data fetched and displayed?**
  - **Lore Catalog:** `useLoreList(filters)` → `loreService.getPublicLore()` with the current search, category and sort
  - **Lore Details:** `useLoreEntry(entryId)` → `loreService.getLoreById()`, plus `useProject(projectId)` for the sidebar
  - **Project Details:** `useProject(projectId)` loads the Project, its folders and its Lore Entries
  - **My Projects:** `useProjects(userId)` → `projectService.getProjectsByOwner()`
  - **My Constellation:** `useConstellation(userId)` → `constellationService.getConstellation()`
  - **Creator Profile:** `useProfile(userId)` loads the profile, Projects, Lore Entries, Constellation and appreciated lore at the same time
  - **Edit pages:** load the record to fill the form (Edit Profile uses `useOwnProfile()`)

### Update (PUT/PATCH)

- **How does the author edit an existing record?** The Edit button on the details page (only the author sees it) opens `/lore/:entryId/edit`. The form is filled with the current values, and `loreService.updateLore()` saves the changes. Choosing another Project moves the entry there.
- **How is the UI updated after the change?** The user lands on the details page, which loads the updated entry.
- Projects work the same way (`/projects/:projectId/edit`). Edit Profile (`/profile/edit`) saves with `profileService.updateProfile()` and then opens the user's profile.

### Delete

- **How does the author delete an existing record?** The Delete button on the details page (only the author sees it) opens a confirmation dialog. After confirming, `loreService.deleteLore()` deletes the entry. The database also deletes its appreciations and saves.
- **How is the UI updated after the change?** The user lands on the entry's Project page, where the entry is gone.
- **Deleting a Project** opens a confirmation dialog. If the Project has lore, the user chooses:
  - delete the lore together with the Project, or
  - move the lore to another of their Projects first (offered only if they have one). Moved entries arrive outside any folder.
- The move and the delete happen in one database step, so if either fails, nothing changes. Afterwards, the user lands on My Projects.

### Other Data Changes

- **Folders:** the owner creates, renames and deletes folders in the Project sidebar. Folders can't contain other folders. Deleting a folder never deletes lore: its entries move to the top level of the Project.
- **Appreciations:** `appreciationService.appreciate()` adds the user's row to `appreciations`, and `appreciationService.removeAppreciation()` deletes it.
- **Constellation saves:** `constellationService.saveLore()` adds a row to `constellation_saves`, and `constellationService.unsaveLore()` deletes it (Save on Lore Details, Remove on My Constellation).
- These buttons show a waiting state and change only after the database confirms. If a request fails, nothing changes, and a short message says why.
- **Private lore:** making an entry private, moving it into a private Project or making its Project private hides that lore from everyone else and removes it from every Constellation. Making it public again shows it again. Removed saves don't come back. Appreciations are kept: the author still sees their count, and they count again once the lore is public.

---

## 8. Forms & Validation

### Forms Used

- Register
- Login
- Create / Edit Lore Entry
- Create / Edit Project
- Edit Profile
- Folder name (new folder and rename folder, in the Project sidebar)
- Catalog search
- Delete Project dialog (choose what happens to the Project's lore)

All inputs are controlled (`value` or `checked` with `onChange`). Forms are sent with the `onSubmit` synthetic event. The Delete Project dialog is confirmed with a button click (`onClick`). Other synthetic events used include `onBlur` and `onKeyDown`.

### Validation Rules

- **Lore title:** required; 3–100 characters; spaces at the start and end are removed.
- **Lore description** (multiple rules): required; at least 20 characters; at most 5,000 characters.
- **Lore category:** required; one of the 12 categories.
- **Lore project:** required; one of the user's own Projects.
- **Tags:** optional; up to 10 tags; each up to 30 characters; letters, numbers, spaces and hyphens only, with at least one letter or number; saved in lowercase; duplicates are removed. A live preview shows the tags as they will be saved.
- **Image / cover link:** optional; must be a valid `http(s)` link.
- **Project title:** required; 3–80 characters; spaces at the start and end are removed. **Project description:** optional; up to 1,000 characters.
- **Project format:** required; one of the formats. **Project genre:** optional ("No genre"); one of the genres.
- **Folder name:** required; 1–50 characters; spaces at the start and end are removed; unique within its Project (upper and lower case count as the same).
- **Username** (register, multiple rules): required; 3–30 characters; Latin letters (a–z) and numbers only; saved in lowercase; must not be taken already.
- **Email:** required; valid email format.
- **Password** (register, multiple rules): required; at least 8 characters and at most 72; only Latin letters (A–Z), numbers and symbols, with no spaces; at least one uppercase letter, one lowercase letter, one number and one special character; must match Repeat Password. A checklist under the field shows which rules are met.
- **Display name** (edit profile): required; 1–50 characters. **Bio:** optional; up to 500 characters. Spaces at the start and end are removed from both, and a counter shows how many characters are used.
- **Avatar link** (edit profile): optional; must be a valid `http(s)` link. A preview shows the picture. A link that doesn't open a picture can still be saved, with a warning.
- **Star colour** (edit profile): one of six colours; Lantern Gold by default.
- **Catalog search:** optional; up to 100 characters; spaces at the start and end are removed.
- **Delete Project dialog:** when the user chooses to move the lore, choosing the Project to move it to is required.

The database checks the main rules too: lengths, allowed values, link and username format, and unique usernames and folder names. Invalid data is rejected even if someone skips the form.

Invalid fields show a message under the input. The submit button is disabled while the request runs, and server errors appear above the form (or under the field in the small folder form).

---

## 9. React-Specific Techniques

### Hooks & Component Lifecycle

- **Which hooks are used, and where?**
  - `useState`: form values, loading and error states, open menus and dialogs
  - `useEffect`: loading data (the data hooks), the login listener (`AuthProvider`), the avatar link check on Edit Profile (`useDebouncedValue`, `useImageCheck`) and starting or stopping the Home animations and fade-ins
  - `useContext`: reading `AuthContext` (through `useAuth`) and `HomeMotionContext` (through `useHomeMotion`)
  - `useCallback`: functions the data hooks return, such as `refetch` (used by Try again) and `removeEntry` (takes a card off My Constellation without reloading the board)
  - `useMemo`: the category counts and filtered cards on My Constellation, the generated star backgrounds, and the layout of the Home category wheel
  - `useTransition`: the waiting state (`isPending`) of the Appreciate, Save and Remove buttons
  - `useRef`: elements that receive keyboard focus (such as the catalog search box), the confirmation dialog, the Home page's animated sky, and a flag that ignores double clicks on Appreciate, Save and Remove
  - `useId`: links form labels, hints and error messages to their inputs
  - Router hooks: `useParams` (ids in the URL), `useNavigate` (redirects after saving), `useSearchParams` (filters and tabs in the URL), `useLocation` (the page to return to after login), `useOutletContext` (the entry, the Project and the Try again focus from `ProjectWorkspaceLayout`)
  - Custom hooks (28), by feature:
    - auth: `useAuth` (reads `AuthContext`), `useViewerKey` (data hooks reload when the logged-in user changes)
    - lore: `useLoreList` (Lore Catalog), `useLoreEntry` (Lore Details, Edit Lore)
    - projects: `useProjects` (My Projects, the lore form's Project list, the Delete Project dialog), `useProject` (Project Details, the Project sidebar, Edit Project), `useFolders` (the lore form's folder list)
    - appreciation: `useAppreciation` (Appreciate button)
    - constellation: `useSaveStatus` (Save button), `useConstellation` (My Constellation), `usePinPositions` (the dotted lines on the board)
    - profile: `useProfile` (Creator Profile and its "All …" pages), `useOwnProfile` (Edit Profile), `useRetryFocus` (keeps keyboard focus after Try again: on the Creator Profile and its "All …" pages, and, called in `ProjectWorkspaceLayout`, on Lore Details and Project Details)
    - home: `useHomeMotion`, `useShowcasePlayback`, `useOrreryTurn`, `useLinePhase` (the Home animations and the Pause animations button), `useSectionReveal` (fades in each section's parts as they come into view)
    - shared: `useForm` (the Login, Register, Lore, Project and Edit Profile forms), `useDebouncedValue` and `useImageCheck` (the avatar link check), `useOutsideClick` (closes the sidebar menus)
    - shared, used on the Home page: `useActiveSection` and `useIsBelowHeader` (the header), `usePrefersReducedMotion`, `useInView` and `useIsPageVisible` (stop the Home animations while they are off screen, the tab is hidden or reduced motion is on)
- **Give one example of mount / update / unmount behavior in your app.** `useLoreList` on the Lore Catalog (`src/features/lore/hooks/useLoreList.js`):
  - **Mount:** when the catalog opens, its `useEffect` loads the public entries.
  - **Update:** when the search, category or sort in the URL changes, the same effect loads the entries again, while the page stays open.
  - **Unmount:** the effect's cleanup marks the old request as outdated, so a late answer never updates a page that has closed.

### Context API

- **What state/data is shared through Context, and which components consume it?**
  - **`AuthContext`** is provided by `AuthProvider`, which wraps all routes in `App.jsx`. It shares `user`, `isAuthLoading` and the `login`, `register` and `logout` actions.
  - Its consumers (through `useAuth`):
    - the layout: `MainLayout` (logout) and the header (navigation)
    - the route guards: `AuthGuard`, `GuestGuard`, `OwnerGuard`
    - the Login and Register pages
    - pages that need the user: Home (its buttons), My Projects, Create Lore, Edit Lore, Create Project, My Constellation, Edit Profile (through `useOwnProfile`) and the catalog's empty state
    - pages that check ownership: Lore Details, Project Details, `ProjectWorkspaceLayout` (the sidebar), Creator Profile and its collection pages
    - the Appreciate and Save buttons and their hooks
    - the data hooks that reload when the logged-in user changes (through `useViewerKey`)
  - **`HomeMotionContext`** is provided by `HomeMotionProvider`, which wraps the Home page.
    - It shares the "Pause animations" switch (`isMotionPaused`, `setIsMotionPaused`), the system's reduced-motion setting (`prefersReducedMotion`) and `isMotionAllowed` (true when the animations are not paused and reduced motion is off).
    - Its consumers (through `useHomeMotion`) are the welcome banner, the About section and its previews, the category wheel, the closing section's lantern and the fade-ins of every section (`useSectionReveal`). One press of the button pauses them all.

### Component Styling

- **How are components styled?** With Tailwind CSS 4 utility classes in the JSX (mostly layout and spacing) and external CSS files for the look of each part. Tailwind runs through the `@tailwindcss/vite` plugin. There are no CSS Modules, no CSS-in-JS and no UI library.
  - `src/index.css` is imported once in `main.jsx`. It loads Tailwind, defines the theme colours and fonts (Cinzel and Inter), sets the base styles and pulls in `src/styles/components.css`.
  - Every other CSS file sits in a `styles/` folder inside its feature (or in `src/shared/styles/`), and the components or pages that use it import it (for example, `LoreCard.jsx` imports `lore-card.css`, and `HomePage.jsx` imports `home.css` and `reveal.css`).
  - Values that differ per item (such as a creator's star colour or the position of a generated star) are set through the `style` prop, mostly as CSS variables.
  - The app has one dark theme. The animations respect the system's reduced-motion setting.
- **External CSS files (28):**

| File                                                     | What it styles                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/index.css`                                          | Tailwind, theme colours and fonts, base styles                                     |
| `src/styles/components.css`                              | shared classes: buttons, cards, form fields, badges, dialogs, page headers         |
| `src/shared/styles/creator-link.css`                     | an author's avatar and name link                                                   |
| `src/shared/styles/pill-button.css`                      | the Appreciate and Save buttons                                                    |
| `src/shared/styles/sigil.css`                            | the generated cover for Projects without an image                                  |
| `src/features/auth/styles/auth.css`                      | the Login and Register pages                                                       |
| `src/features/appreciation/styles/appreciate-button.css` | the Appreciate button's count                                                      |
| `src/features/constellation/styles/constellation.css`    | the pin board and pin cards (My Constellation and Creator Profiles)                |
| `src/features/home/styles/home.css`                      | the Home page layout, FAQ and closing section                                      |
| `src/features/home/styles/hero.css`                      | the Home welcome banner and the Pause animations button                            |
| `src/features/home/styles/nebula.css`                    | the animated sky behind the welcome banner                                         |
| `src/features/home/styles/about.css`                     | the About cards                                                                    |
| `src/features/home/styles/showcases.css`                 | the three animated examples (Create, Share, Explore)                               |
| `src/features/home/styles/categories.css`                | the category list on small screens                                                 |
| `src/features/home/styles/orrery.css`                    | the category wheel on large screens                                                |
| `src/features/home/styles/closing-lantern.css`           | the animated lantern in the closing section                                        |
| `src/features/home/styles/reveal.css`                    | how the Home sections fade in when they come into view                             |
| `src/features/lore/styles/catalog.css`                   | the Lore Catalog page: header, search bar, toolbar, notices                        |
| `src/features/lore/styles/category-chips.css`            | the category filter buttons (also on My Constellation)                             |
| `src/features/lore/styles/lore-card.css`                 | the lore cards                                                                     |
| `src/features/lore/styles/lore-details.css`              | the Lore Details page                                                              |
| `src/features/lore/styles/lore-form.css`                 | the tags preview in the lore form                                                  |
| `src/features/lore/styles/lore-placeholder.css`          | the generated picture for entries without an image                                 |
| `src/features/profile/styles/profile.css`                | the Creator Profile and its "All …" pages                                          |
| `src/features/profile/styles/edit-profile.css`           | Edit Profile: the avatar preview and the star colours                              |
| `src/features/profile/styles/nebula-avatar.css`          | avatar pictures and the generated avatar                                           |
| `src/features/projects/styles/my-projects.css`           | the My Projects page and its loading animation                                     |
| `src/features/projects/styles/workspace.css`             | the Project sidebar (on Project Details and Lore Details) and the Project overview |

---

## 10. Typical User Flow

1. A guest opens Lorelight, browses the Lore Catalog, filters by category and opens an entry.
2. The guest clicks Appreciate, is sent to the Login page, registers a new account and comes back to the entry.
3. The new user creates a Project for their world and adds a Lore Entry to it (both start private).
4. When the entry is ready, the user makes the entry and its Project public, so the entry appears in the catalog.
5. Another user finds the entry, appreciates it and saves it to their Constellation.
6. The author later edits the entry, moves it to another Project or deletes it, then logs out.

---

## 11. Error & Edge Case Handling

- **Authentication errors:**
  - Wrong login details, an email that is already registered and a username that is taken each show a clear message on the form.
  - Guests who open a private page are sent to the Login page. Logged-in users who open Login or Register are sent to the Lore Catalog.
  - If logging out fails, a message below the header says so, with a Dismiss button.
- **Network or data errors:**
  - Every page that loads data shows a loading state. If the request fails, the page shows an error message with a Try again button instead of crashing. When a page fails to load, its Try again button keeps keyboard focus on the page (on the heading, or on the result count in the catalog and on My Constellation) instead of sending it back to the top.
  - If saving a form fails, the form keeps what the user typed and shows the error above it (in the small folder form, under the field).
  - If Appreciate, Save or Remove fails, nothing changes, and a short message says why.
  - Nothing is sent twice: while a request runs, the form submit buttons and the Delete, Appreciate, Save and Remove buttons ignore further clicks.
  - In a catalog link, an unknown category or sort is ignored (all categories, newest first).
- **Empty or missing data states:**
  - When there is nothing to show, the catalog, My Projects, My Constellation and profile tabs say so in a short message. Owners also get a link to the next step (for example "Create a project").
  - A search without results offers to clear the filters.
  - Projects, Lore Entries and profiles without a picture (or with a link that doesn't load) show a generated picture instead of a broken image.
  - Missing or private records, and links with an invalid id, show a "not found" message ("Lore not found", "Project not found", "Creator not found").
  - When a saved entry becomes private, it is removed from every Constellation automatically.
  - Unknown URLs show the Not Found page.

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

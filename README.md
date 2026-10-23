# Lorelight

Lorelight is a worldbuilding platform for writing, organizing and sharing fictional lore. Creators organize their worlds into Projects, write Lore Entries (characters, locations, factions, artifacts and more) inside them, choose what stays private and what gets published, and discover other creators' public lore.

**Live app:** https://lorelight.vercel.app

**Demo account:** Email: `demo@lorelight.app` / Password: `Abc123!?`

---

## Getting Started

### Prerequisites

- Node.js 22.22 or newer
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
| `npm run lint`    | Checks the code with ESLint             |

---

# Functional Guide

## 1. Project Overview

**Application Name:** Lorelight

**Application Category / Topic:** Worldbuilding platform (content creation and sharing)

**Main Purpose:**
Lorelight gives writers, game masters and worldbuilders one place to keep the lore of their fictional worlds. Users create Projects for their worlds, write Lore Entries inside them, and decide what is private or public, either per entry or for a whole Project. Public lore appears in a searchable catalog, where other users can appreciate (like) entries and save them to their personal Constellation (pin board) for inspiration. Lorelight is free to use.

---

## 2. User Access & Permissions

### Guest (Not Authenticated)

- **Available pages / routes:** Home (`/`), Lore Catalog (`/lore`), Lore Details (`/lore/:entryId`), Project Details (`/projects/:projectId`), Creator Profile (`/profile/:userId`), Creator's Collection (`/profile/:userId/:collection`), Login (`/login`), Register (`/register`)
- **Public data shown:** public Lore Entries in public Projects (title, category, description, tags, author, project, appreciation count), public Projects with their public lore, creator profiles (avatar, display name, `@username`, bio, creator title and figures, public Projects and lore, the creator's Constellation of saved inspiration and the public lore they appreciated)
- Guests can see appreciation counts, but the Appreciate and Save buttons prompt them to log in.

### Authenticated User

- **Main sections / pages:** Lore Catalog, My Projects (`/projects`), My Constellation (`/constellation`), Create Lore (`/lore/create`), Create Project (`/projects/create`), own profile and Edit Profile (`/profile/edit`)
- **Details pages:** Lore Details and Project Details, including the user's own private entries and projects
- **Create / Edit / Delete actions:**
  - Create, edit and delete **their own** Lore Entries and Projects
  - Appreciate and remove appreciation from public Lore Entries (including their own)
  - Save and remove public Lore Entries from their Constellation
  - Edit their own profile: display name, bio, avatar link and star colour
  - Edit and Delete buttons are shown only to the author, and Supabase Row Level Security rejects modification attempts from anyone else

---

## 3. Authentication & Session Handling

### Authentication Flow

1. **App load:** `AuthContext` subscribes to Supabase's `onAuthStateChange`, whose first event delivers the stored session. Until it arrives, `isAuthLoading` is `true` and the route guards show a loader instead of redirecting.
2. **Status check:** once the session is known, `AuthContext` exposes the current `user` (or `null`) to the whole app. The same listener keeps running, so every login, logout or token refresh updates the app automatically.
3. **Successful login / registration:** Supabase returns a session, the context updates, the header switches to the logged-in navigation, and `GuestGuard` redirects the user to the page they originally tried to open (or to `/lore`). On registration, the form first checks that the username is still available; after sign-up, a database trigger creates the user's `profiles` row with that username and uses it as the initial display name.
4. **Logout:** the user is first sent to the home page, then the Supabase session is cleared on this device and the context resets `user` to `null`.

### Session Persistence

- **Storage:** the Supabase client stores the session in `localStorage`. `AuthContext` holds the current user in React state and shares it through Context.
- **Automatic login after refresh:** on page load, `AuthContext` restores the session from storage through Supabase, so the user stays logged in without re-entering credentials.

---

## 4. Routing Structure

### Route Guards Logic

- **`AuthGuard`** (layout route): wraps all private routes. Guests are redirected to `/login`, and the original location is remembered for the redirect after login.
- **`GuestGuard`** (layout route): wraps `/login` and `/register`. Logged-in users are redirected to the page they originally wanted, or to `/lore`.
- **`OwnerGuard`** (component): used inside the edit pages after the record has loaded. If the current user is not the owner, they are redirected to the record's details page. Edit Profile doesn't need it: `/profile/edit` has no id in the URL and always opens the logged-in user's own profile.

### Main Routes

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

That is 16 routes: 6 public pages, 7 pages for logged-in users (2 of them author-only), 2 guest-only pages and a Not Found fallback. The dynamic pages (loading data from the backend) are the Lore Catalog, Lore Details, Project Details, Creator Profile, Creator's Collection, My Projects and My Constellation. A Creator's Collection page (`:collection` is `projects`, `lore`, `constellation` or `appreciated`) lists everything in one of the profile's tabs; any other value shows the Not Found page.

The Home page (`/`) is a static introduction that loads no data: a hero with sign-up and login actions for guests (create and explore actions for logged-in users), three expandable previews (Create, Share, Explore), every lore category with a link to the filtered catalog, a short FAQ and a closing call to action. On Home, the header also links to the About, Categories and FAQ sections and highlights the one in view (for logged-in users, these links appear in the menu on small screens and in the header bar on screens at least 1280 px wide).

### Nested & Parameterized Routes

- **Nested routing:** yes. All routes render inside `MainLayout` (header, `<Outlet />`, footer). `AuthGuard` and `GuestGuard` are layout routes whose child routes render through `<Outlet />`. Project Details and Lore Details share the `ProjectWorkspaceLayout` layout route: it loads the Project (and the open Lore Entry) and renders the Project sidebar, which stays mounted while only the page beside it changes. Both pages read its data with `useOutletContext`.
- **URL parameters:** `/lore/:entryId`, `/lore/:entryId/edit`, `/projects/:projectId`, `/projects/:projectId/edit`, `/profile/:userId`, `/profile/:userId/:collection`
- **Search parameters:** the catalog stores search, category and sort in the URL (e.g. `/lore?q=dragon&category=creature&sort=oldest`; the default newest-first order is left out of the URL). My Constellation stores its category filter the same way (e.g. `/constellation?category=location`), and so does a creator's full Constellation page. A Creator Profile keeps the open tab in the URL (e.g. `/profile/:userId?tab=lore`), so it survives a refresh and can be shared.

---

## 5. List → Details Flow

### Catalog / List Page

- **Data displayed:** a grid of public Lore Entries from public Projects, showing title, category, the world (Project) the entry belongs to, a short description excerpt, tags, author (display name) and appreciation count.
- **Interaction:**
  - **Search** by title, description, or an exact tag
  - **Filter** by category, chosen with buttons (one category at a time, or all)
  - **Sort** by newest or oldest
  - Filters are kept in the URL, so a filtered view survives refresh and can be shared.
  - The catalog shows at most 100 entries at a time. When that limit is reached, a note suggests searching or choosing a category to narrow the results down.

### Details Page

- **Navigation:** each Lore Card is a `<Link>` to `/lore/:entryId`. After creating or editing an entry, `useNavigate` redirects to its details page.
- **Route parameter data:** `entryId` is read with `useParams` in the workspace layout route and passed to the `useLoreEntry(entryId)` hook, which loads the entry together with its author and project; `LoreDetailsPage` receives it through `useOutletContext`. Missing and private entries, and ids that aren't valid, show a "not found" state.
- **Page content:** the entry is shown inside its Project's workspace: the Project's sidebar (folders and entries, with the open entry highlighted, loaded with `useProject`) and, beside it, a banner with the entry's image (or a generated print of its category's emblem), category, title, author, Project, folder and dates, then the Appreciate button with the appreciation count, the description and the tags. Moving between the Project's overview and its entries, or from one entry to another, keeps the sidebar in place (with its filter and open folders) and only loads the entry; the Project itself isn't loaded again. The author also sees Edit and Delete buttons and a short note on who can see the entry.
- **Appreciate:** logged-in users appreciate an entry, or remove their appreciation, by clicking the Appreciate button, which also shows the count. Authors can appreciate their own public entries too. Guests who click it are taken to the login page and brought back to the entry afterwards. On an author's private entry (or a public entry in a private Project) only the count is shown, with a short note, because only public lore can be appreciated.
- **Save:** next to it, the Save button adds the entry to the user's Constellation or removes it again; its star fills once the entry is saved. Like Appreciate, it waits for the database before it changes, it works for the author's own public entries too, and guests are taken to the login page.

### My Constellation

- **Data displayed:** the user's saved entries as cards on a framed star chart (a pin board), most recently saved first. Each card shows the entry's image (or its emblem print), category, title, the world (Project) it belongs to, its author and when it was saved, and links to the entry's details page.
- **Star-threads:** each card hangs on a star-pin in its category's colour, and dotted threads of stardust join the saved entries of the same category, so every category forms its own constellation. Each thread runs from one pin to the next in a gentle curve behind the cards, so it shows in the gaps between them. The threads are faint at first; hovering or focusing a card lights up its category's threads, while the pins of the other categories fade. On narrow screens (one column of cards) a straight dotted thread joins the cards once a category is chosen.
- **Filter:** category buttons above the board (All, plus every category the user has saved, each with its number of entries) show one category at a time and light up its whole constellation. The choice is kept in the URL, so it survives a refresh and Back/Forward step through it. Filtering happens in the browser, because all saved entries are already loaded.
- **Remove:** each card has a Remove button. The card shows that it's being removed and leaves the board only after the database has confirmed it; a confirmation line then names the removed entry, and keyboard focus moves to the next card. If a category's last entry is removed, the board offers "Show all" and a link to that category in the Lore Catalog. A Constellation without any saves shows an invitation to explore the catalog.

### Creator Profile

- **Navigation:** author names on cards and details pages, and the `@username` link in the header (for the user's own profile), open `/profile/:userId`. The id is read with `useParams` and passed to the `useProfile(userId)` hook.
- **Header:** a framed card in front of a night sky that is generated for each creator. It shows the creator's avatar inside a star-shaped frame (the picture from the profile's avatar link, or a generated nebula that is unique to the creator when there is no link or the picture fails to load), the display name, `@username`, "Member since" (month and year) and the bio. Each profile has a star colour (one of six), which tints the sky, the avatar frame, the creator title and small accents; the name, bio and other text keep fixed colours, so their contrast never depends on it.
- **Figures:** the number of Projects, Lore Entries, appreciations received (the sum over the creator's lore that the viewer can see) and Constellation saves, plus "Currently worldbuilding" with a link to the creator's most recently updated public Project.
- **Creator title:** a title from the lore category the creator has published the most public lore in (for example "Keeper of Locations"; in a tie, the tied category with the newest public entry wins). Only public lore counts, also when the owner looks at their own profile, so everyone sees the same title. Creators without public lore have no title.
- **Tabs:** Projects, Lore, Constellation and Appreciated (the public lore the creator has appreciated), each with its number of items. A tab shows its three most recent items as cards (Projects by last update, Lore by creation, saves and appreciations by when they were made) and, when there are more, an "All …" link to `/profile/:userId/:collection`, which lists every item, newest first. The full Constellation page shows the same pin board as My Constellation, with its category filter, but without Remove buttons; the owner gets a link to My Constellation to manage it. The tabs follow the WAI-ARIA tabs pattern (arrow keys, Home and End move between them).
- **Owner and visitors:** visitors see only public items; the owner sees everything, with private entries, private Projects and public entries inside a private Project marked on their cards. The owner also sees an Edit profile button and, with the tabs, one sentence on who can see the open tab (for example "Everyone can see the public lore you appreciate."; the owner's own appreciated entries that are no longer public stay in their list, marked, but visitors don't see them). Each empty tab explains itself: the owner gets a next step (such as "Create a project"), a visitor a short sentence.

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

Logged-in users open **Create Lore** from the header, with the "Add Lore" button on one of their Projects (which pre-selects that Project), or with "New lore entry here" in one of its folders (which pre-selects that folder too). Every entry belongs to a Project, so the form collects the Project (required), an optional Folder (only the chosen Project's folders are listed), title, category, description, tags, an optional image URL and a public/private setting. Users without any Projects see a prompt to create one first. On submit, `loreService.createLore()` inserts the row with the current user as `author_id`, and the user is redirected to the new entry's details page.

New Projects and Lore Entries are private until their owner makes them public.

### Read (GET)

- **Catalog:** `useLoreList(filters)` → `loreService.getPublicLore()` loads public entries with the active search, category and sort.
- **Details:** `useLoreEntry(entryId)` → `loreService.getLoreById()`, plus `useProject()` for the Project sidebar
- **Project Details:** loads the project, its folders and its lore entries.
- **Profile:** `useProfile(userId)` loads the creator's profile, Projects, Lore Entries, Constellation saves and appreciated lore at the same time (`profileService.getProfileById()`, `projectService.getProjectsByOwner()`, `loreService.getLoreByAuthor()`, `constellationService.getConstellation()`, `appreciationService.getAppreciatedLore()`); visitors get only public items, the owner everything. The figures, the creator title and the three most recent items per tab are worked out from these lists, and the Creator's Collection pages reuse the same hook.
- **Edit Profile:** `useOwnProfile()` → `profileService.getProfileById()` loads the logged-in user's own profile (the id comes from `AuthContext`) to pre-fill the form.
- **My Constellation:** `useConstellation(userId)` → `constellationService.getConstellation()` loads the current user's saved entries with their Project and author, most recently saved first.

### Update (PUT/PATCH)

- **How the author edits:** the Edit button on the details page (visible only to the author) opens `/lore/:entryId/edit`. The form is pre-filled with the current values, and `loreService.updateLore()` saves the changes. Changing the Project selector moves the entry to another of the user's Projects; the entry leaves its folder unless a folder of the new Project is chosen.
- **UI update:** after a successful update, the user is redirected to the details page, which loads the updated entry.
- **Edit Profile:** the Edit profile button on the user's own Creator Profile opens `/profile/edit`. The form is pre-filled with the current avatar link, display name, bio and star colour. The avatar link shows a live preview inside the star frame once the typing pauses, and if the link doesn't open a picture, a warning under the field says so once the link has been checked (the profile then shows the generated nebula). Choosing a star colour re-tints the preview at once. `profileService.updateProfile()` saves the changes, and the user lands on their profile, which loads the updated values.

### Delete

- **How the author deletes:** the Delete button on the details page (visible only to the author) opens a confirmation dialog. After confirming, `loreService.deleteLore()` removes the entry. Its appreciations and Constellation saves are deleted automatically by the database.
- **UI update:** the user is redirected to the details page of the Project the entry belonged to, where the deleted entry no longer appears.

Deleting a **Project** opens a dialog with two choices:

- **Delete with its lore:** the Project is deleted, and the database removes its Lore Entries (and their appreciations and Constellation saves) automatically.
- **Move lore, then delete:** all entries are first moved to another Project the user chooses, then the empty Project is deleted. Both steps run in one database transaction (the `move_lore_and_delete_project` function), so an entry added to the Project at the same moment can't be lost, and nothing changes if a step fails. This option only appears when the user owns another Project.

**Projects** follow the same pattern: after creating or editing a Project, the user lands on its details page; after deleting it, on My Projects.

Making a **Project private** hides all of its Lore Entries from everyone else, without changing each entry's own public/private setting. Making the Project public again restores them.

**Folders** organize the lore inside a Project (one level). The owner creates, renames and deletes them from the Project's sidebar. Deleting a folder never deletes lore: its entries move back to the top level of the Project.

**Appreciations** are added and removed on Lore Details: `appreciationService.appreciate()` inserts the user's row in `appreciations`, and `appreciationService.removeAppreciation()` deletes it. While the request is on its way, the button shows that it's being processed; only after the database has accepted the change does the button light up (or go out) and the count change. If the request fails, nothing on the page changes, and a short message explains why.

**Constellation saves** work the same way: the Save button on Lore Details calls `constellationService.saveLore()` (insert into `constellation_saves`) or `constellationService.unsaveLore()` (delete), and the Remove button on My Constellation calls `unsaveLore()`. Each shows a pending state while its request is on its way and changes the page only after the database has confirmed it; a removed card leaves the board at that moment. If a request fails, the entry stays as it was, with a short message on the button's line or on the card.

---

## 8. Forms & Validation

### Forms Used

- Register
- Login
- Create / Edit Lore Entry
- Create / Edit Project
- Edit Profile
- Folder name (new folder / rename folder, inline in the Project sidebar)
- Delete Project dialog (a controlled choice: delete the lore, or move it to another Project; confirmed with its Delete button)
- Catalog search (submitted with Enter or the Search button). The category buttons and the sort select beside it apply immediately, without a submit.

All forms use controlled inputs (`value` + `onChange`) and submit through the `onSubmit` synthetic event. Delete confirmations (such as the Delete Project dialog) are confirmed with a button click in a confirmation dialog.

### Validation Rules

- **Lore title:** required; 3–100 characters; leading and trailing spaces are removed.
- **Lore category:** required; must be one of the predefined categories.
- **Lore project:** required; must be one of the user's own Projects.
- **Lore description** (multiple rules): required; at least 20 characters; at most 5,000 characters.
- **Tags:** optional; up to 10 tags; each tag up to 30 characters; letters, numbers, spaces and hyphens only, with at least one letter or number; stored in lowercase; duplicates are removed. While the user types, the form shows a live preview of the tags exactly as they will be saved, with any problem marked on its tag.
- **Image / cover URL:** optional; if filled in, must be a valid `http(s)` URL.
- **Project title:** required; 3–80 characters; leading and trailing spaces are removed. **Project description:** optional; up to 1,000 characters.
- **Folder name:** required; 1–50 characters; leading and trailing spaces are removed; must be unique within its Project (ignoring upper/lower case).
- **Project format:** required; must be one of the predefined formats. **Project genre:** optional ("No genre"); if chosen, must be one of the predefined genres.
- **Username** (register, multiple rules): required; 3–30 characters; letters (a–z) and numbers only (no spaces or special characters); saved in lowercase; must not already be taken (case-insensitive).
- **Display name** (edit profile): required; 1–50 characters; any characters allowed. **Bio:** optional; up to 500 characters. Leading and trailing spaces are removed from both, and a live counter under each field shows how many characters are used (for example "16 / 50 characters").
- **Avatar link** (edit profile): optional; if filled in, must be a valid `http(s)` URL. Once the typing pauses, the link is checked and a live preview shows the picture inside the star frame. A link that doesn't open a picture can still be saved; a warning under the field says so once the check has finished, because the profile would then show the generated nebula. "Use my nebula" empties the field.
- **Star colour** (edit profile): required; one of the six colours (Lantern Gold by default), chosen with radio buttons; the choice re-tints the avatar preview.
- **Email:** required; valid email format.
- **Password** (register, multiple rules): required; at least 8 characters; at most 72 characters (fewer with accented or non-Latin letters, which take more space); at least one uppercase letter, one lowercase letter, one number and one special character; must match the Repeat Password field. A checklist under the field shows all rules from the start and marks each one as met while the user types. A five-star strength meter fills in as rules are met, and both password fields have a show/hide button.

The same length limits are enforced by database check constraints, so invalid data is rejected even if the form is bypassed.

Invalid fields show a message under the input. The submit button is disabled while a request is in progress, and server errors are shown above the form (or under the field in the small inline folder form).

---

## 9. React-Specific Techniques

### Hooks & Component Lifecycle

- **Hooks used:**
  - `useState` — form fields, loading and error states, UI toggles
  - `useEffect` — data fetching, auth subscription, a scroll-spy observer, keeping the chosen category in view in the category row (which scrolls sideways on phones), and on My Constellation a `ResizeObserver` that measures where the cards' star-pins ended up, so the threads can be drawn between them (it measures again when the board changes size or the cards change, and is disconnected in the effect's cleanup), and on a Creator Profile moving keyboard focus to the page's heading after Try again (`useRetryFocus`), and on Edit Profile a timer that waits until the typing in the avatar link pauses (`useDebouncedValue`; the cleanup cancels the timer when the link changes again) and a check in the background whether the link opens a picture (`useImageCheck`; the cleanup ignores a late answer about a link that has been replaced)
  - `useContext` — reading `AuthContext` through the `useAuth` hook
  - `useCallback` — a stable `refetch` function returned by the data hooks, plus `updateData` in `useProject` and `useLoreEntry`, `setHasAppreciated` in `useAppreciation`, `setIsSaved` in `useSaveStatus` and `removeEntry` in `useConstellation`, which apply a change without reloading (a saved folder change, a deleted entry, or an appreciation, save or removal the database has accepted), and `retry` in `useRetryFocus`
  - `useMemo` — on My Constellation, the category counts, the entries of the chosen category, the star-threads (built again only when the cards or their measured positions change, not on every hover) and the board's seeded star field; on a Creator Profile, the creator's seeded sky and the shape of the avatar's star frame
  - `useTransition` — the Appreciate and Save buttons and My Constellation's Remove buttons send their requests as async Actions: `isPending` shows that the request is being processed (the Appreciate and Save icons pulse, Appreciate's count reads "…", a removed card shows "Removing…"), and the page changes only when the database has answered
  - `useRef` — the confirmation dialog element, the password input (keeping the cursor in place when the password is shown or hidden), the focus targets of the Project sidebar and its menus, on the Lore Catalog the category row (scrolled to the chosen or focused category), the search input (focus stays in it after a search) and the result count (focus moves there after a filter is removed or after Try again), in the Appreciate and Save buttons a flag that ignores a second click until the first request has finished, plus the button itself (focus moves to it after Try again), on each Constellation card the same flag for its Remove button, and on My Constellation the board and card list (measured for the threads), the cards' title links (focus moves to the next card after a removal) and the count line (focus moves there after the last card of a view is removed, after "Show all" and after Try again), and on a Creator Profile the tab buttons (the arrow keys move focus between them), the page's heading (focus moves there after Try again) and a flag that remembers that Try again was pressed
  - `useId` — unique ids that link form labels, hints and error messages to their inputs (and Edit Profile's star colour group to its hint and error), the Appreciate button to its description (the count in words), the Save button to its notes, the category buttons to their group label, and a Creator Profile's tabs to their panels
  - `useParams`, `useNavigate`, `useSearchParams`, `useLocation`, `useOutletContext` — routing (`useSearchParams` keeps the catalog's filters, My Constellation's category and a Creator Profile's open tab in the URL; `useOutletContext` passes the workspace layout's data to Project Details and Lore Details)
  - Custom hooks — `useAuth`, `useViewerKey`, `useForm`, `useLoreList`, `useLoreEntry`, `useProjects`, `useProject`, `useFolders`, `useAppreciation`, `useSaveStatus`, `useConstellation`, `usePinPositions`, `useProfile`, `useOwnProfile`, `useRetryFocus`, `useDebouncedValue`, `useImageCheck`, `useOutsideClick`, `useActiveSection`, `useIsBelowHeader`
- **Mount / update / unmount example:**
  - **Mount:** `AuthContext` subscribes to `onAuthStateChange`; the first event delivers the stored session.
  - **Update:** `useLoreList` refetches whenever the search, category or sort parameters in the URL change, while the Catalog page stays mounted (the previous cards stay on screen, dimmed, until the new ones arrive). `useLoreEntry(entryId)` likewise refetches when `entryId` changes, e.g. when the browser's Back button returns from one entry's details page to another, and `useProfile(userId)` when a creator's name on one profile opens another creator's profile. `useLoreEntry`, `useProject`, `useFolders`, `useAppreciation`, `useSaveStatus`, `useConstellation` and `useProfile` also reload when the logged-in user changes: their request key includes `useViewerKey()`, because owners see private rows that others don't (and `useAppreciation` and `useSaveStatus` because their answer is the logged-in user's own). For example, after a logout in another tab, an open private Lore Details page reloads as a guest and shows "not found".
  - **Unmount:** `AuthContext` unsubscribes from the auth listener in its effect cleanup. Data hooks mark in-flight requests as stale in their cleanup, so a late response never updates an unmounted component. On My Constellation, `usePinPositions` disconnects its `ResizeObserver` in its cleanup, both when the page closes and before it measures a new set of cards. On Edit Profile, `useDebouncedValue` clears its pending timer in the cleanup, so the timer never fires after the page has closed (or after the avatar link has changed again).

### Context API

- **`AuthContext`** shares the current user, `isAuthLoading`, and the `login`, `register` and `logout` actions.
- **Consumers:** `MainLayout` (logout), Header (navigation), the Home page (call-to-action buttons), `AuthGuard`, `GuestGuard`, `OwnerGuard`, Login and Register pages, My Projects (the user's own Projects), Project Details and Lore Details (owner actions), the Project workspace layout (the sidebar's owner tools), the Lore Catalog's empty-state call to action (Register or Log in for guests, Create Lore for users), Lore/Project forms (author id), My Constellation (the user's own saves and their removal), the Creator Profile and its collection pages (whether the profile is the user's own: Edit profile, the notes on who can see each tab, the private items' markers), Edit Profile (the user's id, read by `useOwnProfile` to load their own profile), `useViewerKey` (used by `useProject`, `useLoreEntry`, `useFolders`, `useAppreciation`, `useSaveStatus`, `useConstellation` and `useProfile`, so their data reloads when the logged-in user changes), and the appreciation and Constellation buttons.

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
- **Network or data errors:** every data-loading page shows a loading state, and failed requests show an error message with a retry button instead of crashing. Failed mutations show an error and keep the form data, so nothing is lost. The Appreciate button never shows a change before the database has accepted it, so a failed appreciation (or removal) leaves the button and the count as they were and is explained in one line under the button, for example when the entry was made private in the meantime. The Save button and My Constellation's Remove buttons follow the same rule: a failed save or removal changes nothing and says why.
- **Empty or missing data states:**
  - The catalog, projects and Constellation show a friendly empty state with a call to action. Each empty tab on a Creator Profile explains itself: the owner gets a next step, a visitor one sentence.
  - Searches without results suggest clearing the filters. On My Constellation, a category with no saved entries left (for example after removing its last one) offers "Show all" and a link to that category in the catalog.
  - Projects without a cover image, or whose image fails to load, show a generated pattern that is unique to each Project instead of a broken image.
  - Lore Entries without an image, or whose image fails to load, show a generated print of their category's emblem (for example a crown for Politics), also unique to each entry.
  - Profiles without an avatar link, or whose picture fails to load, show a generated nebula in the profile's star colour, unique to each creator. Edit Profile shows a warning under the avatar link when the link doesn't open a picture.
  - Missing or private records (including anything inside a private Project) show a "not found" state, and so do creator profiles that don't exist ("Creator not found").
  - If a saved entry becomes private, directly or because its Project becomes private, it is removed from every Constellation automatically, so no one sees a broken card.
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
├── app/            # App, routes, providers, layout, app-level pages
├── features/
│   ├── auth/           # AuthContext, guards, login/register, auth service
│   ├── home/           # Home page sections (static content, no data)
│   ├── lore/           # catalog, details, lore forms, lore service
│   ├── projects/       # project pages, forms, project service
│   ├── constellation/  # saved lore
│   ├── appreciation/   # appreciate button, hook and service
│   └── profile/        # creator profiles
├── shared/         # shared UI components, hooks and utilities
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
Page (or its layout route) → custom hook → service → Supabase → service → hook → page/components
```

Example: `/lore/:entryId` → `ProjectWorkspaceLayout` (the layout route around `LoreDetailsPage`) → `useLoreEntry(entryId)` → `loreService.getLoreById()` → Supabase; `LoreDetailsPage` then receives the entry through `useOutletContext()`.

Another: `/profile/:userId` → `ProfilePage` → `useProfile(userId)` → `profileService.getProfileById()`, `projectService.getProjectsByOwner()`, `loreService.getLoreByAuthor()`, `constellationService.getConstellation()` and `appreciationService.getAppreciatedLore()`, all at once → Supabase.

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

All ids are UUIDs generated by the database. Uploaded images are stored in a public Supabase Storage bucket (`images`), in one folder per user.

### Security

Authorization is enforced in the database with Row Level Security, not only in the UI:

- A Lore Entry is public only when both the entry and its Project are public. Owners can also read their own private rows.
- Only the owner can create, update or delete their lore and projects, and lore can only be written into the author's own Projects.
- Only a Project's owner can create, rename or delete its folders, and an entry can only be placed in a folder of its own Project. Other users see a folder only while it contains public lore. Deleting a folder never deletes lore: its entries move back to the top level of the Project.
- Users can upload images only into their own Storage folder (JPEG, PNG or WebP, up to 2 MB) and delete only their own images. Nobody can list other users' files.
- Users can add appreciations and Constellation saves only for public lore, and can add or remove only their own. Constellations and appreciations of public lore are publicly visible on creator profiles; saved lore that becomes private is removed from them automatically, and appreciated lore that becomes private disappears from the profile for everyone except its author.
- Table privileges add a second layer under RLS: guests can only read, and ids, owners, usernames and timestamps can't be changed through the API.
- Check constraints mirror the form validation rules (lengths, categories, project genres and formats, tags, username format, folder names), so invalid data is rejected even if the frontend is bypassed.

The database schema, constraints, triggers and policies are stored as numbered SQL files in `supabase/migrations/`, with demo content in `supabase/seed.sql`.

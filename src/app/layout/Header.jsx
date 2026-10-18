import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useActiveSection } from "../../shared/hooks/useActiveSection.js";
import { useIsBelowHeader } from "../../shared/hooks/useIsBelowHeader.js";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import {
  HERO_EYEBROW_ID,
  HOME_SPY_SECTION_IDS,
} from "../../features/home/constants/homeSections.js";
import GuestNavLinks from "./GuestNavLinks.jsx";
import HomeSectionLinks from "./HomeSectionLinks.jsx";
import UserNavLinks from "./UserNavLinks.jsx";

// Every other page, and Home as soon as any hero text reaches the bar
const FROSTED_CLASSES = "border-night-700 bg-night-900/90 backdrop-blur";
// Home while all of the hero text sits below the bar. The border stays 1px wide, so the height never shifts.
const TRANSPARENT_CLASSES = "border-transparent bg-transparent";
// Below lg, an open dropdown keeps the bar frosted, so the bar and the panel read as one surface.
// From lg up there is no dropdown, so these classes do nothing there.
const MENU_OPEN_CLASSES = "max-lg:border-night-700 max-lg:bg-night-900/90 max-lg:backdrop-blur";

export default function Header({ isHome = false, isLoggingOut = false, onLogout }) {
  const { user, isAuthLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeSectionId = useActiveSection(HOME_SPY_SECTION_IDS, isHome);
  // The bar turns frosted the moment the hero's first line of text reaches it,
  // so text never runs beneath a transparent header
  const isHeroTextClear = useIsBelowHeader(HERO_EYEBROW_ID, isHome);

  const isTransparent = isHome && isHeroTextClear;
  const transparentClasses = isMenuOpen
    ? `${TRANSPARENT_CLASSES} ${MENU_OPEN_CLASSES}`
    : TRANSPARENT_CLASSES;
  const surfaceClasses = isTransparent ? transparentClasses : FROSTED_CLASSES;

  // While the stored session is being restored, neither set of account links shows,
  // so a logged-in user never sees the guest links flash on refresh
  const isLoggedIn = !isAuthLoading && Boolean(user);
  const isGuest = !isAuthLoading && !user;

  function toggleMenu() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleBrandClick() {
    closeMenu();

    // Already on Home, the link alone wouldn't move the page. With no behavior given,
    // the scroll follows the CSS: smooth on Home, unless reduced motion is on.
    if (isHome) {
      window.scrollTo({ top: 0 });
    }
  }

  function handleLogoutClick() {
    closeMenu();
    onLogout();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && isMenuOpen) {
      closeMenu();
      // The focused link disappears with the dropdown, so focus goes back to the menu button
      document.getElementById("menu-button")?.focus();
    }
  }

  // Tabbing out of the open dropdown closes it, so it never covers the element that gets focus.
  // relatedTarget is empty when a click lands on something that can't take focus (Safari
  // doesn't focus clicked buttons), so such clicks never close the menu.
  function handleBlur(event) {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
      closeMenu();
    }
  }

  return (
    <header
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`sticky top-0 z-40 h-(--header-height) border-b transition-colors duration-300 motion-reduce:transition-none ${surfaceClasses}`}
    >
      <div className="site-column relative flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          onClick={handleBrandClick}
          className="flex items-center gap-2 font-display text-xl font-bold text-parchment-100 no-underline hover:text-gold-300"
        >
          <img src="/favicon.png" alt="" className="size-9" />
          Lorelight
        </Link>

        {/* p-2.5 around the 24px icon gives a 44px touch target */}
        <button
          id="menu-button"
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-2.5 text-parchment-100 hover:text-gold-300 lg:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        {/* A dropdown panel below lg (scrollable on short screens, with a shadow so it visibly
            floats above the page), an inline row from lg up */}
        <div
          id="main-menu"
          className={`${isMenuOpen ? "flex" : "hidden"} absolute inset-x-0 top-full max-h-[calc(100svh-var(--header-height))] flex-col overflow-y-auto border-b border-night-700 bg-night-900 p-4 shadow-lg shadow-black/40 lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {/* A logged-in user's links are longer, so for them (and until the session is known)
              the section links only fit inline in the bar from xl up */}
          {isHome && (
            <HomeSectionLinks
              activeSectionId={activeSectionId}
              onNavigate={closeMenu}
              isInlineFromXl={!isGuest}
            />
          )}

          {/* py-3 gives 44px touch targets in the dropdown; lg:py-2 keeps the inline row compact */}
          <nav aria-label="Main" className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
            {/* end: /lore/create and /lore/:id/edit aren't the catalog page */}
            <NavLink to="/lore" end onClick={closeMenu} className="nav-link py-3 lg:py-2">
              Lore Catalog
            </NavLink>
            {isLoggedIn && (
              <UserNavLinks
                user={user}
                isHome={isHome}
                isLoggingOut={isLoggingOut}
                onNavigate={closeMenu}
                onLogout={handleLogoutClick}
              />
            )}
            {isGuest && <GuestNavLinks onNavigate={closeMenu} />}
          </nav>
        </div>
      </div>
    </header>
  );
}

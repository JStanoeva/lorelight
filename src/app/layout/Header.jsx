import { useState } from "react";
import { Link, NavLink } from "react-router";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  }

  return (
    <header
      onKeyDown={handleKeyDown}
      className="sticky top-0 z-40 border-b border-night-700 bg-night-900/90 backdrop-blur"
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 font-display text-xl font-bold text-parchment-100 no-underline hover:text-gold-300"
        >
          <img src="/favicon.png" alt="" className="size-9" />
          Lorelight
        </Link>

        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-2 text-parchment-100 hover:text-gold-300 md:hidden"
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

        {/* A dropdown panel on small screens, an inline row from md up */}
        <nav
          id="main-menu"
          aria-label="Main"
          className={`${isMenuOpen ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 border-b border-night-700 bg-night-900 p-4 md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0`}
        >
          <NavLink to="/lore" onClick={closeMenu} className="nav-link">
            Lore Catalog
          </NavLink>
          <NavLink to="/login" onClick={closeMenu} className="nav-link">
            Login
          </NavLink>
          <Link to="/register" onClick={closeMenu} className="btn btn-primary md:ml-2">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

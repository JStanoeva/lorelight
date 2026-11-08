import { Link } from "react-router";

const REPOSITORY_URL = "https://github.com/JStanoeva/lorelight";

export default function Footer() {
  // While a field has focus, its blur error would push the footer down mid-click and lose the
  // click, so a main-button press keeps the focus in the field.
  function handleMouseDown(event) {
    if (event.button === 0 && document.activeElement?.matches("input, textarea, select")) {
      event.preventDefault();
    }
  }

  return (
    <footer className="border-t border-night-700 bg-night-900">
      <div className="site-column flex flex-col items-center gap-4 px-4 py-8 text-sm text-parchment-500 sm:px-6 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="size-6" />
          <span>&copy; 2026 Lorelight · Where your worlds come to light.</span>
        </div>

        <nav aria-label="Footer">
          {/* py-1 gives 28px tap targets; -my-1 keeps the footer as tall as the text */}
          <ul className="-my-1 flex flex-wrap justify-center gap-x-6">
            <li>
              <Link
                to="/lore"
                onMouseDown={handleMouseDown}
                className="inline-block py-1 text-parchment-300 no-underline hover:text-gold-300"
              >
                Lore Catalog
              </Link>
            </li>
            <li>
              <a
                href={REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
                onMouseDown={handleMouseDown}
                className="inline-block py-1 text-parchment-300 no-underline hover:text-gold-300"
              >
                GitHub repository
              </a>
            </li>
            <li>
              <a
                href={`${REPOSITORY_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
                onMouseDown={handleMouseDown}
                className="inline-block py-1 text-parchment-300 no-underline hover:text-gold-300"
              >
                MIT License
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

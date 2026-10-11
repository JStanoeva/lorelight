import { HOME_SECTIONS } from "../../features/home/constants/homeSections.js";

// Plain #anchors instead of <Link>: the browser scrolls natively (stopping below the sticky header),
// and clicking the same link a second time scrolls again.
export default function HomeSectionLinks({ activeSectionId, onNavigate }) {
  return (
    <nav
      aria-label="On this page"
      className="mb-2 flex flex-col gap-1 border-b border-night-700 pb-3 lg:mr-1 lg:mb-0 lg:flex-row lg:items-center lg:border-b-0 lg:border-r lg:pr-3 lg:pb-0"
    >
      {/* The nav's aria-label already names it, so this visible label is hidden from screen readers */}
      <p
        aria-hidden="true"
        className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-parchment-500 lg:hidden"
      >
        On this page
      </p>
      {HOME_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={onNavigate}
          aria-current={activeSectionId === section.id ? "true" : undefined}
          className="nav-link py-3 lg:py-2"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

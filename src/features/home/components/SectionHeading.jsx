import StarRule from "./StarRule.jsx";

// The numeral is hidden from screen readers, so "I" is never read out as a word
export default function SectionHeading({ titleId, numeral, eyebrow, title, children }) {
  return (
    <div className="section-heading">
      <StarRule />
      <p className="section-eyebrow mt-5" data-reveal-item>
        {numeral && <span aria-hidden="true">{numeral} · </span>}
        {eyebrow}
      </p>
      <h2 id={titleId} className="section-title mt-3" data-reveal-item>
        {title}
      </h2>
      {children && <p className="section-intro mt-4" data-reveal-item>{children}</p>}
    </div>
  );
}

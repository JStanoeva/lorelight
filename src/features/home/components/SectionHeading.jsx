import StarRule from "./StarRule.jsx";

// Chapter heading for About, Categories and FAQ. The eyebrow matches the header link, and its
// numeral is hidden from screen readers so "I" is never read out as a word.
// `children` is the optional intro paragraph. The star rule, eyebrow, title and intro are the
// first parts of the section's fade-in (useSectionReveal), before the section's own content.
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

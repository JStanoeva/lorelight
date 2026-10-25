import StarGlyph from "./StarGlyph.jsx";

// The ornament that opens every chapter: a hairline, the logo's star, a mirrored hairline.
// It is the first part of its section's fade-in (useSectionReveal).
export default function StarRule() {
  return (
    <div className="star-rule" aria-hidden="true" data-reveal-item>
      <span className="star-rule-line" />
      <StarGlyph className="star-rule-star" />
      <span className="star-rule-line star-rule-line-end" />
    </div>
  );
}

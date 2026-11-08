import StarGlyph from "./StarGlyph.jsx";

export default function StarRule() {
  return (
    <div className="star-rule" aria-hidden="true" data-reveal-item>
      <span className="star-rule-line" />
      <StarGlyph className="star-rule-star" />
      <span className="star-rule-line star-rule-line-end" />
    </div>
  );
}

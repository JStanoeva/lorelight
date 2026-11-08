import { useId } from "react";
import StarGlyph from "../../home/components/StarGlyph.jsx";
import "../styles/auth.css";

export default function AuthPanel({ title, subtitle, children }) {
  const titleId = useId();

  return (
    <div className="auth-page">
      <div className="auth-sky" aria-hidden="true">
        <StarGlyph className="auth-flare auth-flare-1" />
        <StarGlyph className="auth-flare auth-flare-2" />
        <StarGlyph className="auth-flare auth-flare-3" />
      </div>

      <section className="auth-card" aria-labelledby={titleId}>
        <div className="auth-head">
          <div className="auth-emblem" aria-hidden="true">
            <span className="auth-emblem-line" />
            <StarGlyph className="auth-emblem-star" />
            <span className="auth-emblem-line auth-emblem-line-end" />
          </div>

          <h1 id={titleId} className="auth-title">
            {title}
          </h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        {children}
      </section>
    </div>
  );
}

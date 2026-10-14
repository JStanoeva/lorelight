import { useId } from "react";
import StarGlyph from "../../home/components/StarGlyph.jsx";
import "../styles/auth.css";

// The whole Login/Register page (starry backdrop + card), so those pages return <AuthPanel> directly.
export default function AuthPanel({ title, subtitle, children }) {
  const titleId = useId();

  return (
    <div className="auth-page">
      {/* Three faint stars from the logo, far out on wide screens only */}
      <div className="auth-sky" aria-hidden="true">
        <StarGlyph className="auth-flare auth-flare-1" />
        <StarGlyph className="auth-flare auth-flare-2" />
        <StarGlyph className="auth-flare auth-flare-3" />
      </div>

      <section className="auth-card" aria-labelledby={titleId}>
        <div className="auth-head">
          {/* Hairline, the logo's star, mirrored hairline: the same ornament as on Home */}
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

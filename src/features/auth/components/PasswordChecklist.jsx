import { STAR_PATH } from "../../home/constants/starPath.js";
import {
  PASSWORD_RULE_COUNT,
  getPasswordChecks,
  getPasswordStrength,
  getStrengthLabel,
  getStrengthSummary,
} from "../utils/authValidation.js";
import StrengthMeter from "./StrengthMeter.jsx";

function getStrengthValueClassName(password, isComplete) {
  if (password === "") {
    return "pw-meter-value pw-meter-value-empty";
  }

  return isComplete ? "pw-meter-value pw-meter-value-strong" : "pw-meter-value";
}

// The "night sky" panel under the Register password field: the strength meter and the five
// password rules, each marked with a star that fills in once the rule is met. Everything is
// derived from the password during render, so the panel needs no state of its own.
// `id` goes on the rules list, so the password input can point at it with aria-describedby.
export default function PasswordChecklist({ id, password }) {
  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(password);
  const isComplete = strength === PASSWORD_RULE_COUNT;

  return (
    <div className={isComplete ? "pw-panel pw-panel-complete" : "pw-panel"}>
      <div className="pw-meter">
        <StrengthMeter strength={strength} />
        <p className="pw-meter-text">
          {/* The hidden colon makes screen readers say "Strength: Fair", not "Strength Fair" */}
          <span className="pw-meter-caption">
            Strength<span className="sr-only">:</span>
          </span>
          <span className={getStrengthValueClassName(password, isComplete)}>
            {getStrengthLabel(password, strength)}
          </span>
        </p>
      </div>

      {/* role="list": Safari drops the list semantics of a list without bullets */}
      <ul id={id} role="list" className="pw-rules">
        {checks.map((check) => (
          <li key={check.id} className={check.isMet ? "pw-rule pw-rule-met" : "pw-rule"}>
            <svg className="pw-rule-star" viewBox="-2 -2 28 38" aria-hidden="true" focusable="false">
              <path className="pw-star-path" d={STAR_PATH} />
            </svg>
            {/* The hidden prefix tells screen readers what the star's colour and fill show */}
            <span>
              <span className="sr-only">{check.isMet ? "Met: " : "Not met: "}</span>
              {check.label}
            </span>
          </li>
        ))}
      </ul>

      {/* The only live text: one short sentence that changes only when the number of met rules
          changes, so a screen reader never re-reads the whole list on every keystroke */}
      <p className="sr-only" aria-live="polite">
        {getStrengthSummary(password, strength)}
      </p>
    </div>
  );
}

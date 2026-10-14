// The calm note under Repeat password: "Passwords match" (success) or "Passwords don't match"
// (neutral, because the person may still be typing). The box itself is always in the page,
// empty when there is nothing to say: a polite live region must exist before its text changes,
// or screen readers miss the change. React only updates the text when `state` changes, so each
// change is announced once, never on every keystroke.
export default function PasswordMatchHint({ id, state }) {
  return (
    <div id={id} className="pw-match-region" aria-live="polite">
      {state === "match" && (
        <p className="pw-match pw-match-ok">
          <svg className="pw-match-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="7.25" fill="currentColor" />
            <path className="pw-match-check" d="M4.9 8.3l2.1 2.1 4.1-4.3" />
          </svg>
          Passwords match
        </p>
      )}

      {state === "mismatch" && (
        <p className="pw-match">
          <svg className="pw-match-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path className="pw-match-ne" d="M3.25 6.25h9.5M3.25 9.75h9.5M10.25 3 5.75 13" />
          </svg>
          Passwords don't match
        </p>
      )}
    </div>
  );
}

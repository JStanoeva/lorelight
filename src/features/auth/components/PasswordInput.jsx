import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

// A password field with a show/hide toggle. Label, error and aria wiring work like FormField.
// `children` render between the input and the error (Register puts the match hint there).
// `describedById` links extra help text, such as the password rules, to the input.
export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  toggleLabel = "Show password",
  describedById,
  children,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);

  const id = useId();
  const errorId = `${id}-error`;
  // The error comes first, so a screen reader reads the problem before the longer help text
  const describedBy = [error && errorId, describedById].filter(Boolean).join(" ");

  // A mouse click or tap on the toggle would move focus to the button (and close the phone
  // keyboard), and the input's blur would show its error. Preventing the default keeps focus
  // in the input, so peeking at the password doesn't count as leaving the field.
  // Keyboard use is unaffected.
  function handleToggleMouseDown(event) {
    event.preventDefault();
  }

  // Changing an input's type can move its caret to the start, so the next key would land in
  // front of the password. The caret (or selection) is saved first and put back right after.
  function handleToggleClick() {
    const input = inputRef.current;
    const { selectionStart, selectionEnd } = input;

    // flushSync makes React change the input's type now, not after this handler
    flushSync(() => setIsVisible((wasVisible) => !wasVisible));

    if (document.activeElement !== input) {
      return;
    }

    // Measuring the input makes the browser finish the type change now. Otherwise Chrome
    // moves the caret to the start a moment later, after it has been put back.
    input.getBoundingClientRect();
    input.setSelectionRange(selectionStart, selectionEnd);
  }

  return (
    <div className="auth-field">
      <label htmlFor={id} className="label">
        {label}
      </label>

      <div className="pw-input-wrap">
        {/* Shown as plain text, a password must not be capitalised, corrected or spell-checked */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className="input auth-input pw-input"
        />

        {/* The name never changes; aria-pressed says whether the password is shown */}
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={isVisible}
          aria-controls={id}
          onMouseDown={handleToggleMouseDown}
          onClick={handleToggleClick}
          className="pw-toggle"
        >
          {isVisible ? (
            <svg className="pw-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3.5 3.5l17 17" />
              <path d="M9.6 5.8C10.4 5.6 11.2 5.5 12 5.5c4.2 0 7.5 2.5 9.5 6.5-.6 1.2-1.4 2.3-2.3 3.3" />
              <path d="M5.1 8.4C4 9.5 3.1 10.7 2.5 12c2 3.9 5.3 6.5 9.5 6.5 1.1 0 2.1-.15 3-.45" />
              <path d="M13 14.8A3 3 0 0 1 9.2 11" />
            </svg>
          ) : (
            <svg className="pw-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M2.5 12C4.5 8 7.8 5.5 12 5.5S19.5 8 21.5 12C19.5 16 16.2 18.5 12 18.5S4.5 16 2.5 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {children}

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

import { useId } from "react";

// Renders a label, a control (input, textarea or select) and its messages,
// and links them by id so screen readers announce the error and the hint.
// `describedById` links one more message rendered outside the field, such as a status line.
export default function FormField({
  label,
  error,
  hint,
  describedById,
  as: Control = "input",
  className,
  children,
  ...controlProps
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // The error comes first (like PasswordInput), so a screen reader reads the problem before the hint
  const describedBy = [error && errorId, hint && hintId, describedById].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={className ? `input ${className}` : "input"}
        {...controlProps}
      >
        {children}
      </Control>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

import { useId } from "react";

// Renders a label, a control (input, textarea or select) and its messages,
// and links them by id so screen readers announce the hint and the error.
export default function FormField({
  label,
  error,
  hint,
  as: Control = "input",
  className,
  children,
  ...controlProps
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ");

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

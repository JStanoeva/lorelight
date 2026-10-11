import { useId } from "react";

// Renders a label, a control (input, textarea or select) and its messages,
// and links them by id so screen readers announce the hint and the error.
export default function FormField({
  label,
  error,
  hint,
  as: Control = "input",
  children,
  ...controlProps
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...controlProps}
      >
        {children}
      </Control>
      {hint && <p id={hintId}>{hint}</p>}
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}

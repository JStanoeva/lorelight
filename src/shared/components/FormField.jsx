import { useId } from "react";

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
  // The error comes first, so a screen reader reads the problem before the hint
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

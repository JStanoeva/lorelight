export default function SubmitButton({ isPending, label, pendingLabel, className = "btn btn-primary" }) {
  // Keeps focus in the field: its blur error could push the button down between mousedown and
  // mouseup and lose the click. Keyboard activation is unaffected.
  function handleMouseDown(event) {
    event.preventDefault();
  }

  return (
    <>
      <button type="submit" disabled={isPending} onMouseDown={handleMouseDown} className={className}>
        {isPending ? pendingLabel : label}
      </button>

      {/* Focus usually stays in a field, so the new button text alone isn't announced */}
      <p role="status" className="sr-only">
        {isPending ? pendingLabel : ""}
      </p>
    </>
  );
}

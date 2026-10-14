// The full-width submit button of the Login and Register forms, disabled while the request runs.
export default function AuthSubmitButton({ isPending, label, pendingLabel }) {
  // Clicking moves focus to the button, so the field being left shows its error, which pushes
  // the button down between mousedown and mouseup, and the click is lost. Preventing the
  // default keeps focus where it is. Enter and keyboard activation are unaffected.
  function handleMouseDown(event) {
    event.preventDefault();
  }

  return (
    <>
      <button
        type="submit"
        disabled={isPending}
        onMouseDown={handleMouseDown}
        className="btn btn-primary btn-lg auth-submit"
      >
        {isPending ? pendingLabel : label}
      </button>

      {/* Focus usually stays in a field, so the new button text alone isn't announced.
          This hidden status line tells screen reader users that the request is running. */}
      <p role="status" className="sr-only">
        {isPending ? pendingLabel : ""}
      </p>
    </>
  );
}

// A form's submit button, disabled while the request runs. Login and Register pass a bigger,
// full-width style through `className`.
export default function SubmitButton({ isPending, label, pendingLabel, className = "btn btn-primary" }) {
  // Clicking moves focus to the button, so the field being left shows its error, which can push
  // the button down between mousedown and mouseup, and the click is lost. Preventing the
  // default keeps focus where it is. Enter and keyboard activation are unaffected.
  function handleMouseDown(event) {
    event.preventDefault();
  }

  return (
    <>
      <button type="submit" disabled={isPending} onMouseDown={handleMouseDown} className={className}>
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

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="alert-error flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-ghost shrink-0">
          Try again
        </button>
      )}
    </div>
  );
}

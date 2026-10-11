export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 py-4">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

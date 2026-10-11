export default function Loader({ label = "Loading…" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-8">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span>{label}</span>
    </div>
  );
}

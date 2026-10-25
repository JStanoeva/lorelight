export default function Loader({ label = "Loading…" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-12 text-parchment-300">
      {/* motion-safe: with "reduce motion" turned on, the ring stays still */}
      <span
        aria-hidden="true"
        className="size-6 motion-safe:animate-spin rounded-full border-2 border-gold-400 border-t-transparent"
      />
      <span>{label}</span>
    </div>
  );
}

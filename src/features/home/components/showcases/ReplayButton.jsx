const REPLAY_ICON = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="replay-icon"
  >
    <path d="M3 8a5 5 0 1 0 1.6-3.7" />
    <path d="M3 2.5V5h2.5" />
  </svg>
);

// The accessible name starts with the visible word, so voice control users can say "click Replay"
export default function ReplayButton({ onReplay }) {
  return (
    <button
      type="button"
      className="replay-button"
      aria-label="Replay example animation"
      onClick={onReplay}
    >
      {REPLAY_ICON}
      Replay
    </button>
  );
}

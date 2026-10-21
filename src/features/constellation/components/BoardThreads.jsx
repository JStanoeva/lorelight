// The star-threads between the pins of the same category, drawn behind the cards: each one shows
// in the gaps and passes under the cards on its way. The SVG covers the board surface 1:1 (no
// viewBox), so the measured pixel positions fit as they are. `litCategory` is the category whose
// constellation glows: the one of a hovered or focused card, or the chosen filter. Without one,
// every thread is faint; while a card is pointed at, the other categories fade further.
// Decorative: every card and chip names its category in text.
export default function BoardThreads({ threads, litCategory }) {
  return (
    <svg className="pin-threads" aria-hidden="true" focusable="false">
      {threads.map((thread) => {
        let state = "faint";
        if (litCategory === thread.category) {
          state = "lit";
        } else if (litCategory) {
          state = "dimmed";
        }

        // The category's text colour class paints both strokes (currentColor): a soft glow line
        // with the dotted stardust on top
        return (
          <g key={thread.key} className={`pin-thread ${thread.colorClassName}`} data-state={state}>
            <path d={thread.path} className="pin-thread-glow" />
            <path d={thread.path} className="pin-thread-dots" />
          </g>
        );
      })}
    </svg>
  );
}

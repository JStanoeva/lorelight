// No viewBox: the SVG covers the board surface 1:1, so the measured pin positions fit as they are
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

        // The category's text colour class paints both strokes through currentColor
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

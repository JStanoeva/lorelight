import "../styles/constellation.css";

// The top of My Constellation: a short night-sky band with the title and one line of intro. The
// stars are kept off the text (see .constellation-hero-stars). `showCategoryHint`: whether the
// intro points to the category chips (false on an empty Constellation or after a failed load,
// where there are none).
export default function ConstellationHero({ showCategoryHint }) {
  return (
    <section className="constellation-hero" aria-labelledby="constellation-title">
      <div className="constellation-hero-stars" aria-hidden="true" />

      <div className="constellation-hero-content site-column">
        <p className="constellation-eyebrow">Your pin board of saved lore</p>
        <h1 id="constellation-title" className="constellation-title">
          My Constellation
        </h1>
        <p className="constellation-intro">
          The lore you saved for inspiration, pinned to your own star chart.
          {showCategoryHint && " Choose a category to light up its constellation."}
        </p>
      </div>
    </section>
  );
}

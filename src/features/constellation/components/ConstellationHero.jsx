import "../styles/constellation.css";

export default function ConstellationHero() {
  return (
    <section className="page-hero constellation-hero" aria-labelledby="constellation-title">
      <div className="constellation-hero-stars" aria-hidden="true" />

      <div className="constellation-hero-content site-column">
        <p className="page-hero-eyebrow">Your pin board of saved lore</p>
        <h1 id="constellation-title" className="page-hero-title">
          My Constellation
        </h1>
      </div>
    </section>
  );
}

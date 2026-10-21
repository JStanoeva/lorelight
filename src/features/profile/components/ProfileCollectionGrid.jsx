import PinCard from "../../constellation/components/PinCard.jsx";
import LoreCard from "../../lore/components/LoreCard.jsx";
import ProjectCard from "../../projects/components/ProjectCard.jsx";
import "../../constellation/styles/constellation.css";

// One collection of a profile as a grid of the app's own cards (their titles are h3s: the grid
// always sits under an h2, the tab panel's or the "All …" page's hidden one):
//   projects       ProjectCard (the owner sees Public / Private on each)
//   lore           LoreCard without the author line (the page already says whose lore it is)
//   constellation  PinCard on its star-pin, read-only (Remove lives on My Constellation)
//   appreciated    LoreCard with the author, since it is usually someone else's lore
// The owner's own private or hidden lore is marked on the card (LoreCard's isOwner). Other people's
// entries in the Appreciated list are always public, so they never get a marker.
export default function ProfileCollectionGrid({ collection, items, isOwner }) {
  if (collection === "projects") {
    return (
      <ul className="profile-grid">
        {items.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} showVisibility={isOwner} headingLevel={3} />
          </li>
        ))}
      </ul>
    );
  }

  if (collection === "constellation") {
    return (
      <ul className="profile-grid profile-grid-pins">
        {items.map((entry) => (
          <li key={entry.id}>
            <PinCard entry={entry} isOwner={false} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="profile-grid">
      {items.map((entry) => (
        <li key={entry.id}>
          <LoreCard entry={entry} variant="catalog" isOwner={isOwner} showAuthor={collection !== "lore"} />
        </li>
      ))}
    </ul>
  );
}

import PinCard from "../../constellation/components/PinCard.jsx";
import LoreCard from "../../lore/components/LoreCard.jsx";
import ProjectCard from "../../projects/components/ProjectCard.jsx";
import "../../constellation/styles/constellation.css";

// Card titles are h3s: the grid always sits under an h2 (the tab panel's or a hidden one).
// Pins stay read-only even for the owner: Remove lives on My Constellation.
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

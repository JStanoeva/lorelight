import { Link } from "react-router";
import LoreCard from "../../lore/components/LoreCard.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { formatEntryCount, getNewEntryPath } from "../utils/projectContents.js";

// The project's lore as a grid of cards, or an empty state (different for the owner and visitors).
export default function ProjectLoreSection({ projectId, entries, folders, isOwner }) {
  const folderNames = Object.fromEntries(folders.map((folder) => [folder.id, folder.name]));

  return (
    <section className="ws-lore" aria-labelledby="ws-lore-heading">
      <div className="ws-lore-head">
        <h2 id="ws-lore-heading" className="ws-lore-title">
          Lore
        </h2>
        <span className="ws-lore-count">{formatEntryCount(entries.length)}</span>
        {isOwner && entries.length > 0 && (
          <Link to={getNewEntryPath(projectId)} className="btn btn-primary ws-lore-new">
            <Icon name="plus" />
            Add Lore
          </Link>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="ws-empty">
          <Icon name="star" size={28} className="ws-empty-star" />
          {isOwner ? (
            <>
              <p className="ws-empty-title">This world is waiting for its first story</p>
              <p className="ws-empty-text">Start with a character, a place or an old legend.</p>
              <Link to={getNewEntryPath(projectId)} className="btn btn-primary">
                <Icon name="plus" />
                Add your first lore entry
              </Link>
            </>
          ) : (
            <>
              <p className="ws-empty-title">No public lore here yet</p>
              <p className="ws-empty-text">This world&apos;s stories are still being written.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="ws-grid">
          {entries.map((entry) => (
            <li key={entry.id}>
              <LoreCard entry={entry} folderName={folderNames[entry.folder_id]} isOwner={isOwner} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

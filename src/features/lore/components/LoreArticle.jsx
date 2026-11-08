import LoreActions from "./LoreActions.jsx";
import LoreHeader from "./LoreHeader.jsx";
import "../styles/lore-details.css";

export default function LoreArticle({ headingRef, entry, folderName, isOwner, onDeleted, onAppreciationChange }) {
  const tags = entry.tags ?? [];
  // A drop cap only for a letter in any alphabet (\p{L}), not a quote mark or a digit
  const hasDropCap = /^\p{L}/u.test(entry.description);

  return (
    <article className="lore-details">
      <LoreHeader headingRef={headingRef} entry={entry} folderName={folderName} />
      <LoreActions
        entry={entry}
        isOwner={isOwner}
        onDeleted={onDeleted}
        onAppreciationChange={onAppreciationChange}
      />

      <div className="lore-reading">
        <p className={hasDropCap ? "lore-text has-drop-cap" : "lore-text"}>{entry.description}</p>

        {tags.length > 0 && (
          <div className="lore-tags">
            <h2 className="lore-label">Tags</h2>
            <ul className="lore-tag-list">
              {tags.map((tag) => (
                <li key={tag} className="lore-tag">
                  <span aria-hidden="true">#</span>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

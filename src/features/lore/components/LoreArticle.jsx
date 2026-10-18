import LoreActions from "./LoreActions.jsx";
import LoreHeader from "./LoreHeader.jsx";
import "../styles/lore-details.css";

// One lore entry on Lore Details: the banner with the title, the action row, the text and the tags.
// `folderName` is null when the entry isn't in a folder. `onDeleted` runs after the author deletes it.
export default function LoreArticle({ entry, folderName, isOwner, onDeleted }) {
  const tags = entry.tags ?? [];
  // A drop cap only suits a letter (\p{L}: a letter in any alphabet). A text that starts with
  // a quote mark or a digit starts plainly instead of with a large, odd-looking symbol.
  const hasDropCap = /^\p{L}/u.test(entry.description);

  return (
    <article className="lore-details">
      <LoreHeader entry={entry} folderName={folderName} />
      <LoreActions entry={entry} isOwner={isOwner} onDeleted={onDeleted} />

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

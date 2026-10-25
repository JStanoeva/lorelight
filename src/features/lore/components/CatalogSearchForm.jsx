import { useId, useState } from "react";
import Icon from "../../../shared/components/Icon.jsx";
import { SEARCH_TERM_MAX } from "../utils/searchTerm.js";

// The hero's search bar. A controlled input: typing only changes the field, and Enter or the
// Search button applies it. The parent gives it key={q}, so a new q from the URL (Back/Forward,
// a removed filter) mounts a fresh form that starts from it, with no state-syncing effect.
// `inputRef` lets the page put focus back into the new input after a search.
export default function CatalogSearchForm({ initialQuery, inputRef, onSearch }) {
  const [text, setText] = useState(initialQuery);
  const inputId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(text);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="catalog-search">
      {/* Starts with the placeholder's words, the only ones on screen, so voice control users can
          say what they see to reach the field */}
      <label htmlFor={inputId} className="sr-only">
        Search titles, text, tags of public lore
      </label>
      <Icon name="search" size={20} className="catalog-search-icon" />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search titles, text, tags"
        maxLength={SEARCH_TERM_MAX}
        autoComplete="off"
        enterKeyHint="search"
        className="catalog-search-input"
      />
      <button type="submit" className="btn btn-primary catalog-search-button">
        Search
      </button>
    </form>
  );
}

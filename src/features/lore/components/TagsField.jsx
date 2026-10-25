import { useId } from "react";
import { describeTags, TAGS_MAX } from "../utils/tags.js";
import "../styles/lore-form.css";

// The Tags field: one comma-separated text input, plus a "Saved as" preview of the tags exactly
// as they will be saved (lowercase, without duplicates), with every problem marked on its tag.
// The preview is derived from the text on every render, so it needs no state of its own.
export default function TagsField({ value, onChange, onBlur, error }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const { items, count } = describeTags(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label">
        Tags (optional)
      </label>
      <input
        id={id}
        name="tagsText"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="dragon, ancient magic, north"
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${errorId} ${hintId}` : hintId}
        className="input"
      />

      {/* Not a live region on purpose: announcing the chips on every keystroke would be noise.
          Problems reach screen readers through the error message linked to the input. */}
      {count > 0 && (
        <div className="tags-preview">
          <div className="tags-preview-head">
            <span className="tags-preview-label">Saved as</span>
            <span className={count > TAGS_MAX ? "tags-count tags-count-over" : "tags-count"}>
              {count} / {TAGS_MAX} tags
            </span>
          </div>
          <ul className="tags-chips" aria-label="Tags as they will be saved">
            {items.map((item) => (
              <li key={item.tag} className={item.problem ? "tags-chip tags-chip-invalid" : "tags-chip"}>
                <span className="tags-chip-text">{item.tag}</span>
                {item.problem && (
                  <span className="tags-chip-problem">
                    <span aria-hidden="true">· </span>
                    {item.problem}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p id={hintId} className="field-hint">
        Separate tags with commas. Up to 10 tags, each up to 30 characters: letters, numbers, spaces and
        hyphens.
      </p>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

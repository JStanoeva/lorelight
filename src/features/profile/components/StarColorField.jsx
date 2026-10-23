import { useId } from "react";
import Icon from "../../../shared/components/Icon.jsx";
import { STAR_COLORS } from "../constants/starColors.js";

// Six native radio buttons (arrow keys move between them), drawn as swatch tiles. The chosen one has
// a thicker light border and a check mark in its swatch, so it never depends on colour alone.
// `onMouseDown` (the form's guard) keeps focus where it is when a tile is clicked, so the error of
// the field being left can't move the tile away from under the pointer.
export default function StarColorField({ value, error, onChange, onMouseDown }) {
  const hintId = useId();
  const errorId = useId();

  return (
    <fieldset className="star-color-field" aria-describedby={error ? `${hintId} ${errorId}` : hintId}>
      <legend className="label">Star colour</legend>
      <p id={hintId} className="field-hint mt-1.5">
        Tints your profile's sky, avatar frame and accents.
      </p>

      <div className="star-colors">
        {STAR_COLORS.map((color) => (
          <label key={color.value} className="star-color">
            <input
              type="radio"
              name="star_color"
              value={color.value}
              checked={value === color.value}
              onChange={onChange}
              onMouseDown={onMouseDown}
              className="star-color-input"
            />
            <span className="star-color-swatch" style={{ "--swatch": color.hex }} aria-hidden="true">
              <Icon name="check" size={12} className="star-color-check" />
            </span>
            <span className="star-color-name">{color.label}</span>
          </label>
        ))}
      </div>

      {error && (
        <p id={errorId} className="field-error mt-1.5">
          {error}
        </p>
      )}
    </fieldset>
  );
}

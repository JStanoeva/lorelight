import { LORE_CATEGORIES } from "../../../lore/constants/categories.js";
import { STAR_PATH } from "../../constants/starPath.js";
import { useShowcasePlayback } from "../../hooks/useShowcasePlayback.js";
import { createStardust, toCueList } from "../../utils/showcaseTime.js";
import LightOutline from "./LightOutline.jsx";
import LightText from "./LightText.jsx";
import ReplayButton from "./ReplayButton.jsx";
import Stardust from "./Stardust.jsx";
import "../../styles/showcases.css";

function findCategory(value) {
  return LORE_CATEGORIES.find((category) => category.value === value);
}

// Sample results, with short titles so they stay readable on phones. `from` is the row a card
// starts in, `to` the row it moves to after the search: the two "dragon" matches rise to the
// top, the others sink and fade.
const RESULTS = [
  { id: "choir", title: "The Glass Choir", category: findCategory("culture"), count: 31, from: 0, to: 2, isMatch: false },
  { id: "ashen", title: "The Ashen Dragon", category: findCategory("creature"), count: 24, from: 1, to: 0, isMatch: true },
  { id: "accord", title: "The Salt Accord", category: findCategory("politics"), count: 12, from: 2, to: 3, isMatch: false },
  { id: "roads", title: "The Dragon Roads", category: findCategory("location"), count: 17, from: 3, to: 1, isMatch: true },
];
// The top match, which is appreciated and saved
const PICKED_ID = "ashen";
const MOTES = createStardust(12, 23);

const HEART_ICON = (
  <svg viewBox="0 0 16 16" focusable="false" className="explore-heart">
    <path d="M8 13.5S2.5 10.2 2.5 6.3A2.8 2.8 0 0 1 8 5a2.8 2.8 0 0 1 5.5 1.3C13.5 10.2 8 13.5 8 13.5Z" />
  </svg>
);

const SAVE_STAR = (
  <svg viewBox="0 0 24 34" focusable="false" className="explore-save">
    <path d={STAR_PATH} />
  </svg>
);

const CUES = {
  strip: 200, // your Constellation, four saved stars
  search: 500, // the search field is drawn
  rows: 800, // four public entries
  type: 1600, // "dragon" writes itself in
  filter: 2500, // the matches rise, the rest sink and fade
  appreciate: 3500, // the top match gets one more appreciation
  save: 4500, // and is saved
  fly: 4900, // its light flies up to the Constellation
  join: 6000, // and joins it as a new star
  hold: 6800, // the finished picture (also the reduced-motion still)
  fade: 10000,
};
const CUE_LIST = toCueList(CUES);
const LOOP_MS = 10800;

// Explore: a catalog search, the results rearranging, an appreciation, and a saved entry that
// flies up and becomes a star in the Constellation. The mock is hidden from screen readers; the
// visible caption says what it shows.
export default function ExploreShowcase() {
  const { setStageElement, time, isStill, runId, replay, canReplay, motionState } =
    useShowcasePlayback({ cues: CUE_LIST, finalCue: CUES.hold, loopMs: LOOP_MS });

  const isFiltered = time >= CUES.filter;

  return (
    <figure className="showcase min-w-0" data-motion={motionState} data-still={isStill}>
      <div className="preview-frame">
        <div className="showcase-head">
          <span className="preview-tag" aria-hidden="true">
            Example
          </span>
          {canReplay && <ReplayButton onReplay={replay} />}
        </div>

        <div ref={setStageElement} className="showcase-stage explore-stage" aria-hidden="true">
          <Stardust motes={MOTES} />

          <div key={runId} className="showcase-scene" data-fading={time >= CUES.fade}>
            <div
              className="explore-constellation"
              data-on={time >= CUES.strip}
              data-joined={time >= CUES.join}
            >
              <span className="mock-label">Your Constellation</span>
              <svg viewBox="0 0 200 40" fill="none" focusable="false" className="explore-strip">
                <path pathLength="1" d="M16 26L58 12L100 24L142 10" className="explore-strip-line" />
                <path
                  pathLength="1"
                  d="M142 10L182 24"
                  className="explore-strip-line explore-strip-new-line"
                />
                <circle cx="16" cy="26" r="2.5" className="explore-strip-dot" style={{ "--i": 0 }} />
                <circle cx="58" cy="12" r="2.5" className="explore-strip-dot" style={{ "--i": 1 }} />
                <circle cx="100" cy="24" r="2.5" className="explore-strip-dot" style={{ "--i": 2 }} />
                <circle cx="142" cy="10" r="2.5" className="explore-strip-dot" style={{ "--i": 3 }} />
                <circle cx="182" cy="24" r="9" className="explore-strip-flare" />
                <path
                  d={STAR_PATH}
                  transform="translate(176 14) scale(0.5)"
                  className="explore-strip-new-star"
                />
              </svg>
            </div>

            <div
              className="explore-search light-card"
              data-on={time >= CUES.search}
              data-typed={time >= CUES.type}
            >
              <LightOutline />
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                focusable="false"
                className="mock-search-icon"
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <span className="explore-search-text">
                <span className="explore-search-placeholder">Search lore</span>
                <LightText text="dragon" gapMs={110} />
              </span>
            </div>

            <ul className="explore-results" data-on={time >= CUES.rows}>
              {RESULTS.map((result, index) => (
                <li
                  key={result.id}
                  className="explore-row"
                  data-filtered={isFiltered}
                  data-match={result.isMatch}
                  data-appreciated={result.id === PICKED_ID && time >= CUES.appreciate}
                  data-saved={result.id === PICKED_ID && time >= CUES.save}
                  style={{ "--from": result.from, "--to": result.to, "--i": index }}
                >
                  <span className="explore-row-top">
                    {SAVE_STAR}
                    <span className="explore-row-title">{result.title}</span>
                    <span className={`badge ${result.category.badgeClassName}`}>
                      {result.category.label}
                    </span>
                  </span>
                  <span className="explore-row-meta">
                    {HEART_ICON}
                    <span className="explore-count">
                      <span className="explore-count-old">{result.count}</span>
                      <span className="explore-count-new">{result.count + 1}</span>
                    </span>
                    appreciations
                  </span>
                </li>
              ))}
            </ul>

            {/* The saved entry's light, with three motes of stardust trailing behind it */}
            <span className="explore-flight" data-on={time >= CUES.fly}>
              {[3, 2, 1, 0].map((index) => (
                <span key={index} className="explore-flyer" style={{ "--i": index }} />
              ))}
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-parchment-500">
        Illustration with sample content: a catalog search and a saved entry.
      </figcaption>
    </figure>
  );
}

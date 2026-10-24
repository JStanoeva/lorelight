import { LORE_CATEGORIES } from "../../../lore/constants/categories.js";
import { STAR_PATH } from "../../constants/starPath.js";
import { useShowcasePlayback } from "../../hooks/useShowcasePlayback.js";
import { createStardust, getStepState, toCueList } from "../../utils/showcaseTime.js";
import StarGlyph from "../StarGlyph.jsx";
import LightOutline from "./LightOutline.jsx";
import ReplayButton from "./ReplayButton.jsx";
import Stardust from "./Stardust.jsx";
import "../../styles/showcases.css";

const CHARACTER = LORE_CATEGORIES.find((category) => category.value === "character");
// The catalog's sky: more stars than the other stages, so it reads as a sky
const SKY_STARS = createStardust(22, 41);

// 14px status icons, created once at module level. Decorative: the chip text says the same.
const LOCK_ICON = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="chip-icon"
  >
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);

const GLOBE_ICON = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="chip-icon"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8H14" />
    <path d="M8 2C5.5 4.5 5.5 11.5 8 14C10.5 11.5 10.5 4.5 8 2Z" />
  </svg>
);

const CUES = {
  card: 300, // a dimmed, locked entry under the horizon
  entrySwitch: 2700, // only the entry is made public
  blocked: 3100, // its light rises but fades at the horizon: the Project is still private
  projectSwitch: 5600, // the Project is made public too
  open: 5900, // the horizon mist parts and the lock turns into a globe
  glow: 6300, // the card glows with golden light
  rise: 6900, // and its light floats up into the catalog's sky
  star: 8300, // where it becomes a star
  hold: 9000, // the finished picture (also the reduced-motion still)
  fade: 12400,
};
const CUE_LIST = toCueList(CUES);
const LOOP_MS = 13200;

// When each step of the readable list below is the one being shown
const RULE_STEPS = [
  { from: CUES.card, to: CUES.entrySwitch },
  { from: CUES.entrySwitch, to: CUES.projectSwitch },
  { from: CUES.projectSwitch, to: Infinity },
];

// Share: an entry under the horizon only reaches the catalog's sky when both switches are on.
// The entry itself stays where it is (it is still in its Project); a golden copy of it rises
// from it and becomes its star in the catalog.
// The animated stage is decorative (aria-hidden); the ordered list under it is the real
// information and stays readable for everyone. The animation only highlights the step it shows.
export default function ShareShowcase() {
  const { setStageElement, time, isStill, runId, replay, canReplay, motionState } =
    useShowcasePlayback({ cues: CUE_LIST, finalCue: CUES.hold, loopMs: LOOP_MS });

  const isEntryPublic = time >= CUES.entrySwitch && time < CUES.fade;
  const isProjectPublic = time >= CUES.projectSwitch && time < CUES.fade;
  const isLit = time >= CUES.star && time < CUES.fade;

  return (
    <div
      className="showcase preview-frame min-w-0"
      data-motion={motionState}
      data-still={isStill}
    >
      <div className="showcase-head">
        <span className="preview-tag" aria-hidden="true">
          Example
        </span>
        {canReplay && <ReplayButton onReplay={replay} />}
      </div>

      <div ref={setStageElement} className="showcase-stage share-stage" aria-hidden="true">
        <div className="share-sky">
          <Stardust motes={SKY_STARS} />
          <span className="share-sky-label">Lore Catalog</span>
        </div>

        <div key={runId} className="showcase-scene" data-fading={time >= CUES.fade}>
          <span
            className="share-horizon"
            data-on={time >= CUES.card}
            data-open={time >= CUES.open}
          />

          {/* The star the entry becomes, with faint lines to two neighbours */}
          <span className="share-star" data-on={time >= CUES.star}>
            <svg viewBox="0 0 120 40" fill="none" focusable="false" className="share-star-lines">
              <path pathLength="1" d="M60 20L22 10" />
              <path pathLength="1" d="M60 20L101 31" />
              <circle cx="22" cy="10" r="1.6" />
              <circle cx="101" cy="31" r="1.6" />
            </svg>
            <svg viewBox="0 0 24 34" focusable="false" className="share-star-glyph">
              <path d={STAR_PATH} />
            </svg>
            <span className="share-star-label">Captain Ilsa Varn</span>
          </span>

          {/* Light from the entry that tries to rise but fades out at the horizon */}
          <span className="share-blocked" data-on={time >= CUES.blocked}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span key={index} className="share-blocked-mote" style={{ "--i": index }} />
            ))}
          </span>

          <div
            className="share-card light-card"
            data-on={time >= CUES.card}
            data-entry={time >= CUES.entrySwitch}
            data-open={time >= CUES.open}
            data-glow={time >= CUES.glow}
          >
            <LightOutline />
            <div className="flex items-center gap-2">
              <span className="share-status">
                <span className="share-lock">{LOCK_ICON}</span>
                <span className="share-globe">{GLOBE_ICON}</span>
              </span>
              <span className={`badge ${CHARACTER.badgeClassName}`}>{CHARACTER.label}</span>
            </div>
            <p className="mock-entry-title mt-1.5">Captain Ilsa Varn</p>
          </div>

          {/* The card's golden light: a copy of the card drawn in gold, laid exactly over it,
              which lifts off, floats up and shrinks into the star. It is seen only while it
              moves; the finished picture keeps just the card and its star. */}
          <span className="share-ascent" data-on={time >= CUES.rise}>
            <span className="flex items-center gap-2">
              {GLOBE_ICON}
              <span className="badge bg-gold-400/10 text-gold-300 ring-gold-300/50">
                {CHARACTER.label}
              </span>
            </span>
            <span className="mock-entry-title share-ascent-title mt-1.5">Captain Ilsa Varn</span>
          </span>

          {/* Golden stardust that follows the light up into the sky */}
          <span className="share-trail" data-on={time >= CUES.rise}>
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index} className="share-trail-mote" style={{ "--i": index }} />
            ))}
          </span>

          <div className="share-switches" data-on={time >= CUES.card}>
            <span className="share-switch" data-checked={isEntryPublic}>
              <span className="share-switch-track">
                <span className="share-switch-knob" />
              </span>
              Entry
            </span>
            <span
              className="share-switch"
              data-checked={isProjectPublic}
              data-waiting={time >= CUES.blocked && time < CUES.projectSwitch}
            >
              <span className="share-switch-track">
                <span className="share-switch-knob" />
              </span>
              Project
            </span>
          </div>
        </div>
      </div>

      {/* The rule itself, readable for everyone. The highlight follows the animation. */}
      <figure className="mt-5">
        <figcaption className="preview-caption">Who can see an entry</figcaption>
        <ol className="mt-3 flex flex-col gap-3">
          <li
            className="visibility-step share-rule"
            data-state={getStepState(time, RULE_STEPS[0].from, RULE_STEPS[0].to)}
          >
            <StarGlyph className="visibility-star" />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="status-chip">{LOCK_ICON}Entry: Private</span>
                <span className="status-chip">{LOCK_ICON}Project: Private</span>
              </div>
              <p className="mt-2 text-sm text-parchment-300">Only you can see it.</p>
            </div>
          </li>

          <li
            className="visibility-step share-rule"
            data-state={getStepState(time, RULE_STEPS[1].from, RULE_STEPS[1].to)}
          >
            <StarGlyph className="visibility-star" />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="status-chip status-chip-public">{GLOBE_ICON}Entry: Public</span>
                <span className="status-chip">{LOCK_ICON}Project: Private</span>
              </div>
              <p className="mt-2 text-sm text-parchment-300">Still hidden: its Project is private.</p>
            </div>
          </li>

          {/* The light comes on: gold appears only as light (the star and a glow) */}
          <li
            className="visibility-step share-rule share-rule-last"
            data-state={getStepState(time, RULE_STEPS[2].from, RULE_STEPS[2].to)}
            data-lit={isLit}
          >
            <StarGlyph className="visibility-star share-rule-star" />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="status-chip status-chip-public">{GLOBE_ICON}Entry: Public</span>
                <span className="status-chip status-chip-public">{GLOBE_ICON}Project: Public</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-parchment-100">
                Shown in the Lore Catalog.
              </p>
            </div>
          </li>
        </ol>
      </figure>
    </div>
  );
}

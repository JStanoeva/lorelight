import { LORE_CATEGORIES } from "../../../lore/constants/categories.js";
import { useShowcasePlayback } from "../../hooks/useShowcasePlayback.js";
import { createStardust, toCueList } from "../../utils/showcaseTime.js";
import LightOutline from "./LightOutline.jsx";
import LightText from "./LightText.jsx";
import ReplayButton from "./ReplayButton.jsx";
import Stardust from "./Stardust.jsx";
import "../../styles/showcases.css";

const CHARACTER = LORE_CATEGORIES.find((category) => category.value === "character");
// Short tags, so the empty form never reserves tall blank space on phones (one row from 360px)
const TAGS = ["navigator", "reefs", "tides"];
const MOTES = createStardust(14, 7);

// When each part of the picture appears, in ms
const CUES = {
  world: 300,
  worldText: 1100,
  dust: 1900,
  entry: 2500,
  title: 3200,
  badge: 4700,
  tags: 5200,
  description: 6100,
  finish: 7000,
  thread: 7800,
  hold: 8900, // the finished picture, also the reduced-motion still
  fade: 12400,
};
const CUE_LIST = toCueList(CUES);
const LOOP_MS = 13200;

export default function CreateShowcase() {
  const { setStageElement, time, isStill, runId, replay, canReplay, motionState } =
    useShowcasePlayback({ cues: CUE_LIST, finalCue: CUES.hold, loopMs: LOOP_MS });

  return (
    <figure className="showcase min-w-0" data-motion={motionState} data-still={isStill}>
      <div className="preview-frame">
        <div className="showcase-head">
          <span className="preview-tag" aria-hidden="true">
            Example
          </span>
          {canReplay && <ReplayButton onReplay={replay} />}
        </div>

        <div ref={setStageElement} className="showcase-stage" aria-hidden="true">
          <Stardust motes={MOTES} />

          {/* key: Replay remounts the scene, so every animation starts over */}
          <div key={runId} className="showcase-scene" data-fading={time >= CUES.fade}>
            <div
              className="create-world light-card"
              data-on={time >= CUES.world}
              data-written={time >= CUES.worldText}
            >
              <LightOutline />
              <div className="flex flex-wrap items-center gap-2 light-write" style={{ "--d": 0 }}>
                <span className="mock-label">Project</span>
                <span className="status-chip">Private</span>
              </div>
              <p className="mock-project-title mt-2 light-write" style={{ "--d": 1 }}>
                The Ember Isles
              </p>
              <p className="mt-1 text-sm text-parchment-300 light-write" style={{ "--d": 2 }}>
                A chain of volcanic islands where the sea glows at night.
              </p>
            </div>

            <div
              className="create-link"
              data-dust={time >= CUES.dust}
              data-thread={time >= CUES.thread}
            >
              <span className="create-dust">
                {[0, 1, 2, 3, 4].map((index) => (
                  <span key={index} className="create-dust-mote" style={{ "--i": index }} />
                ))}
              </span>
              <svg viewBox="0 0 72 44" fill="none" focusable="false" className="create-threads">
                <path pathLength="1" className="create-strand create-strand-faint" d="M4 2C1 27 44 16 47 42" />
                <path pathLength="1" className="create-strand create-strand-soft" d="M13 2C17 21 55 24 58 42" />
                <path pathLength="1" className="create-strand" d="M8 2C8 25 52 18 52 42" />
                <path pathLength="1" className="create-pulse" d="M8 2C8 25 52 18 52 42" />
                <path pathLength="1" className="create-pulse create-pulse-late" d="M13 2C17 21 55 24 58 42" />
                <circle cx="8" cy="2" r="2.5" className="create-knot" />
                <circle cx="52" cy="42" r="2.5" className="create-knot create-knot-end" />
              </svg>
            </div>

            <div
              className="create-entry light-card"
              data-on={time >= CUES.entry}
              data-finished={time >= CUES.finish}
            >
              <LightOutline />
              <span className="create-sweep" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="create-field create-field-inline" data-filled={time >= CUES.badge}>
                  <span className="create-placeholder">Category</span>
                  <span className={`badge ${CHARACTER.badgeClassName} create-badge`}>
                    {CHARACTER.label}
                  </span>
                </span>
                <span className="status-chip create-private">Private</span>
              </div>
              <p className="create-field mock-entry-title mt-2" data-filled={time >= CUES.title}>
                <span className="create-placeholder">Title</span>
                <LightText text="Captain Ilsa Varn" gapMs={70} />
              </p>
              <p
                className="create-field mt-1 text-sm text-parchment-300"
                data-filled={time >= CUES.description}
              >
                <span className="create-placeholder">Description</span>
                <span className="create-description">
                  A navigator who charts the reefs that move with the tides.
                </span>
              </p>
              <div className="create-field mt-3" data-filled={time >= CUES.tags}>
                <span className="create-placeholder">Tags</span>
                <span className="flex flex-wrap gap-1.5">
                  {TAGS.map((tag, index) => (
                    <span key={tag} className="tag-chip create-tag" style={{ "--i": index }}>
                      {tag}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-parchment-500">
        Illustration with sample content: a Project with one Lore Entry inside it.
      </figcaption>
    </figure>
  );
}

import Loader from "../../../shared/components/Loader.jsx";

// Where each folder's tab starts in the 120-wide drawing (left, middle, right), so the tabs stand
// staggered like in a real archive drawer. Phones show the first two folders.
const TAB_POSITIONS = [12, 40, 68];

// The front flap of a folder. The drawer hides the bottom of every folder, so the outlines stay open there.
const FRONT_FLAP_PATH = "M3 128V32Q3 27 8 27H112Q117 27 117 32V128";

// A tiny four-point star (the tab's seal), centred on (0, 0)
const STAR_PATH = "M0 -4.5Q0.8 -0.8 4.5 0Q0.8 0.8 0 4.5Q-0.8 0.8 -4.5 0Q-0.8 -0.8 0 -4.5Z";

// The back flap of a folder with its tab on top, in a 120 × 128 drawing; the tab starts at tabX
function backFlapPath(tabX) {
  return `M3 128V22Q3 17 8 17H${tabX}L${tabX + 5} 6Q${tabX + 6} 4 ${tabX + 8} 4H${tabX + 32}Q${tabX + 34} 4 ${tabX + 35} 6L${tabX + 40} 17H112Q117 17 117 22V128`;
}

// While the projects load: ghost folders standing in an archive drawer, lit one after another by a
// passing lantern, and the shared Loader under them. The styles live in my-projects.css.
export default function ProjectsLoading() {
  return (
    <div className="archive-loading">
      <div className="archive-drawer" aria-hidden="true">
        <div className="archive-folders">
          {TAB_POSITIONS.map((tabX) => {
            const backFlap = backFlapPath(tabX);
            const star = `translate(${tabX + 20} 10.5)`;

            return (
              <span key={tabX} className="archive-folder">
                <svg viewBox="0 0 120 128" className="archive-folder-art" focusable="false">
                  <path d={backFlap} className="archive-folder-back" />
                  <path d={FRONT_FLAP_PATH} className="archive-folder-front" />
                  <path d={STAR_PATH} transform={star} className="archive-folder-star" />

                  {/* The same folder in lantern light: the animation fades it in and out */}
                  <g className="archive-folder-lit">
                    <path d={backFlap} className="archive-folder-back" />
                    <path d={FRONT_FLAP_PATH} className="archive-folder-front" />
                    <path d={STAR_PATH} transform={star} className="archive-folder-star" />
                  </g>
                </svg>
              </span>
            );
          })}
        </div>
        <span className="archive-drawer-front" />
      </div>

      <Loader label="Loading your projects…" />
    </div>
  );
}

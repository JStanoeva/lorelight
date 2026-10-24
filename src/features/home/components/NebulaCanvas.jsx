import { useEffect, useRef } from "react";
import { createNebulaRenderer } from "../utils/nebulaRenderer.js";
import HeroFlares from "./HeroFlares.jsx";
import StarGlyph from "./StarGlyph.jsx";
import "../styles/nebula.css";

// The hero's living sky: a WebGL canvas painted by a shader (shaders/nebula.js), plus the
// lantern's star and the bright flares on top of it. The canvas covers the CSS painting
// (HeroBackdrop), which stays underneath as the first paint and the fallback.
// isRunning: whether the sky may move right now. isStill: reduced motion, so the sky shows a
// finished still picture instead.
export default function NebulaCanvas({ isRunning, isStill }) {
  const canvasHostRef = useRef(null);
  const rendererRef = useRef(null);

  // Build the sky once per mount. The canvas is created here and removed in the cleanup, so
  // StrictMode's extra mount-unmount-mount in development always gets a fresh canvas and never
  // leaves two loops running.
  useEffect(() => {
    const renderer = createNebulaRenderer(canvasHostRef.current);
    rendererRef.current = renderer; // null without WebGL: the CSS painting simply stays

    return () => {
      renderer?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setIsStill(isStill);
  }, [isStill]);

  // Run or freeze. Stopping keeps the last frame on screen, and the sky's clock only counts
  // running time, so it continues from exactly the same moment.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !isRunning) {
      return;
    }
    renderer.start();
    return () => renderer.stop();
  }, [isRunning]);

  return (
    <div className="nebula-layer" aria-hidden="true">
      {/* An empty box that React never fills, so the renderer can put its canvas in it */}
      <div ref={canvasHostRef} className="nebula-canvas-host" />
      <HeroFlares />
      <StarGlyph className="hero-star" />
    </div>
  );
}

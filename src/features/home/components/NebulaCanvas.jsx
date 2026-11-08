import { useEffect, useRef } from "react";
import { createNebulaRenderer } from "../utils/nebulaRenderer.js";
import HeroFlares from "./HeroFlares.jsx";
import StarGlyph from "./StarGlyph.jsx";
import "../styles/nebula.css";

// isRunning: the sky may move now. isStill: reduced motion, so it shows one still picture.
export default function NebulaCanvas({ isRunning, isStill }) {
  const canvasHostRef = useRef(null);
  const rendererRef = useRef(null);

  // The canvas is created here and removed in the cleanup, so StrictMode's double mount always
  // gets a fresh canvas and never leaves two loops running.
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

  // Stopping keeps the last frame; the clock counts only running time, so it resumes seamlessly
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

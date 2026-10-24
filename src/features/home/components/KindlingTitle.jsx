import { useEffect, useState } from "react";

const TITLE = "Lorelight";
const LETTERS = Array.from(TITLE);
// The display font the letters light up in; if it takes longer than this, they light up anyway
const TITLE_FONT = '700 1rem "Cinzel"';
const FONT_WAIT_MS = 1500;

// The wordmark, one span per letter so each can catch light on its own (hero.css). Screen
// readers read the hidden plain word; the letter spans are hidden from them, so nobody hears
// "L, o, r, e…".
export default function KindlingTitle() {
  // The letters wait (dimly) for the display font, so they never kindle in the fallback font
  // and then jump when Cinzel arrives
  const [isFontReady, setIsFontReady] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const timeoutId = setTimeout(() => setIsFontReady(true), FONT_WAIT_MS);

    // load() resolves once the font has arrived (or failed: then the fallback is all there is)
    document.fonts
      ?.load(TITLE_FONT)
      .catch(() => {})
      .then(() => {
        if (isCurrent) {
          setIsFontReady(true);
        }
      });

    return () => {
      isCurrent = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <h1
      id="hero-title"
      className="hero-title kindling-title mt-5"
      data-kindle={isFontReady ? "ready" : "waiting"}
    >
      <span className="sr-only">{TITLE}</span>
      <span className="kindling-word" aria-hidden="true">
        {LETTERS.map((letter, index) => (
          // The letters never change or move, so their position is a stable key
          <span key={index} className="kindling-letter" style={{ "--letter-index": index }}>
            {letter}
          </span>
        ))}
      </span>
    </h1>
  );
}

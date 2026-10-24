// Text that writes itself in with light, one letter after another. Each letter is its own span
// with its index in --i, so CSS can start its glow a little later than the one before; the
// bright glow moving along the word looks like the tip of a pen made of light.
// Only used inside decorative, aria-hidden mocks, so splitting the word is never read out.
export default function LightText({ text, gapMs = 70 }) {
  return (
    <span className="light-text" style={{ "--letter-gap": `${gapMs}ms` }}>
      {Array.from(text).map((letter, index) => (
        <span key={index} className="light-letter" style={{ "--i": index }}>
          {letter}
        </span>
      ))}
    </span>
  );
}

// One span per letter, with its index in --i so CSS can stagger the glow. Only used inside
// aria-hidden mocks, so the split word is never read out.
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

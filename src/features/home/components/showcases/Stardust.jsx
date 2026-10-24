// Faint motes of light drifting behind a stage. `motes` comes from createStardust (computed once
// at module level). Decorative only; the stage around it is already hidden from screen readers.
export default function Stardust({ motes }) {
  return (
    <span className="stardust">
      {motes.map((mote) => (
        <span
          key={mote.id}
          className="stardust-mote"
          style={{
            "--x": `${mote.x}%`,
            "--y": `${mote.y}%`,
            "--size": `${mote.size}px`,
            "--delay": `${mote.delay}s`,
            "--duration": `${mote.duration}s`,
          }}
        />
      ))}
    </span>
  );
}

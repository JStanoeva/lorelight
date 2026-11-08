// `motes` comes from createStardust; no aria-hidden here, because the stage is already hidden
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

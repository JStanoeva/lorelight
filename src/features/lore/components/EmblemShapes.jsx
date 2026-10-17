// The parts of one emblem or motif (see loreEmblems.js). The stroke width comes from the <use> that shows it.
export default function EmblemShapes({ shape }) {
  return (
    <>
      {shape.tints?.map((d) => (
        <path key={d} d={d} className="emblem-print-tint" />
      ))}
      {shape.lines?.map((d) => (
        <path key={d} d={d} className="emblem-print-line" />
      ))}
      {shape.rings?.map(([cx, cy, r]) => (
        <circle key={`${cx},${cy},${r}`} cx={cx} cy={cy} r={r} className="emblem-print-line" />
      ))}
      {shape.fills?.map((d) => (
        <path key={d} d={d} className="emblem-print-fill" />
      ))}
      {shape.dots?.map(([cx, cy, r]) => (
        <circle key={`${cx},${cy},${r}`} cx={cx} cy={cy} r={r} className="emblem-print-fill" />
      ))}
    </>
  );
}

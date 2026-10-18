import LoreCard from "./LoreCard.jsx";

// A responsive grid of catalog LoreCards: one column on phones, two from 640px, three from
// 1024px. Each item is a flex box, so every card in a row stretches to the tallest one.
export default function LoreGrid({ entries }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex min-w-0">
          <LoreCard entry={entry} variant="catalog" />
        </li>
      ))}
    </ul>
  );
}

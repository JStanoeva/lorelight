import LoreCard from "./LoreCard.jsx";

// Each item is a flex box, so every card in a row stretches to the tallest one.
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

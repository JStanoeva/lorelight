// The browser tab's title for the page that renders it, e.g. "Lore Catalog · Lorelight". React moves
// a <title> rendered anywhere into the document's <head>. When no page renders one (the Home page,
// or while a page is still loading), the "Lorelight" from index.html shows.
export default function PageTitle({ title }) {
  return <title>{`${title} · Lorelight`}</title>;
}

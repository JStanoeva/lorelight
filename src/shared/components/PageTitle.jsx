// React moves a <title> rendered anywhere into <head>. Without one, index.html's title shows.
export default function PageTitle({ title }) {
  return <title>{`${title} · Lorelight`}</title>;
}

import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        <Link to="/">Go to the home page</Link> or{" "}
        <Link to="/lore">browse the Lore Catalog</Link>.
      </p>
    </section>
  );
}

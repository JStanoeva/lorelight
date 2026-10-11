import { Link } from "react-router";

export default function NotFoundState({
  title = "Page not found",
  text = "The page you are looking for does not exist.",
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <h1>{title}</h1>
      <p>{text}</p>
      <p>
        <Link to="/">Go to the home page</Link> or{" "}
        <Link to="/lore">browse the Lore Catalog</Link>.
      </p>
    </div>
  );
}

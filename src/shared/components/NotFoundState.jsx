import { Link } from "react-router";

export default function NotFoundState({
  title = "Page not found",
  text = "The page you are looking for does not exist.",
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="page-title">{title}</h1>
      <p className="max-w-prose text-parchment-300">{text}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link to="/lore" className="btn btn-primary">
          Browse the Lore Catalog
        </Link>
        <Link to="/" className="btn btn-ghost">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}

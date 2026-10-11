import { Link, NavLink } from "react-router";

export default function Header() {
  return (
    <header>
      <nav className="flex flex-wrap items-center gap-4 p-4">
        <Link to="/">Lorelight</Link>
        <NavLink to="/lore">Lore Catalog</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav>
    </header>
  );
}

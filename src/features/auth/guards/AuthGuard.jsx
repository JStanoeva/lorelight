import { Outlet } from "react-router";

// Temporary pass-through: the logged-in check is added together with authentication.
export default function AuthGuard() {
  return <Outlet />;
}

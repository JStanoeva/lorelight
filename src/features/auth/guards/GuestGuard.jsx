import { Outlet } from "react-router";

// Temporary pass-through: the guest-only check is added together with authentication.
export default function GuestGuard() {
  return <Outlet />;
}

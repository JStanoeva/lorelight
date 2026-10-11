import { Outlet, useLocation } from "react-router";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      {/* A new key on entering or leaving Home gives a fresh header: scroll-spy reset, menu closed */}
      <Header key={isHome ? "home" : "app"} isHome={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

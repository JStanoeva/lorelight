import { Outlet } from "react-router";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

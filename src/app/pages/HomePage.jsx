import { useAuth } from "../../features/auth/hooks/useAuth.js";
import AboutSection from "../../features/home/components/AboutSection.jsx";
import CategoriesSection from "../../features/home/components/CategoriesSection.jsx";
import ClosingCta from "../../features/home/components/ClosingCta.jsx";
import FaqSection from "../../features/home/components/FaqSection.jsx";
import HeroSection from "../../features/home/components/HeroSection.jsx";
// Imported last, after the section styles each component brings in
import "../../features/home/styles/home.css";

// A static introduction: every section renders at once, so the header's scroll-spy
// finds all of them when it starts watching. Only the call-to-action buttons depend on
// whether someone is logged in.
export default function HomePage() {
  const { user, isAuthLoading } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <div className="home-page">
      <HeroSection isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
      <AboutSection />
      <CategoriesSection />
      <FaqSection />
      <ClosingCta isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
    </div>
  );
}

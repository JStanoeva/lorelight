import { useAuth } from "../../features/auth/hooks/useAuth.js";
import AboutSection from "../../features/home/components/AboutSection.jsx";
import CategoriesSection from "../../features/home/components/CategoriesSection.jsx";
import ClosingCta from "../../features/home/components/ClosingCta.jsx";
import FaqSection from "../../features/home/components/FaqSection.jsx";
import HeroSection from "../../features/home/components/HeroSection.jsx";
import HomeMotionProvider from "../../features/home/context/HomeMotionProvider.jsx";
// Imported after the section styles the components bring in; the fade-in comes last because
// it overrides how the sections' parts look until they have been seen
import "../../features/home/styles/home.css";
import "../../features/home/styles/reveal.css";

// Loads no data, so every section renders at once and the header's scroll-spy finds them all
export default function HomePage() {
  const { user, isAuthLoading } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <HomeMotionProvider>
      <div className="home-page">
        <HeroSection isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
        <AboutSection />
        <CategoriesSection />
        <FaqSection />
        <ClosingCta isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
      </div>
    </HomeMotionProvider>
  );
}

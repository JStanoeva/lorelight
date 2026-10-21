import { Route, Routes } from "react-router";
import AuthProvider from "../features/auth/context/AuthProvider.jsx";
import AuthGuard from "../features/auth/guards/AuthGuard.jsx";
import GuestGuard from "../features/auth/guards/GuestGuard.jsx";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import ConstellationPage from "../features/constellation/pages/ConstellationPage.jsx";
import CreateLorePage from "../features/lore/pages/CreateLorePage.jsx";
import EditLorePage from "../features/lore/pages/EditLorePage.jsx";
import LoreCatalogPage from "../features/lore/pages/LoreCatalogPage.jsx";
import LoreDetailsPage from "../features/lore/pages/LoreDetailsPage.jsx";
import EditProfilePage from "../features/profile/pages/EditProfilePage.jsx";
import ProfileCollectionPage from "../features/profile/pages/ProfileCollectionPage.jsx";
import ProfilePage from "../features/profile/pages/ProfilePage.jsx";
import ProjectWorkspaceLayout from "../features/projects/components/ProjectWorkspaceLayout.jsx";
import CreateProjectPage from "../features/projects/pages/CreateProjectPage.jsx";
import EditProjectPage from "../features/projects/pages/EditProjectPage.jsx";
import MyProjectsPage from "../features/projects/pages/MyProjectsPage.jsx";
import ProjectDetailsPage from "../features/projects/pages/ProjectDetailsPage.jsx";
import ScrollToTop from "../shared/components/ScrollToTop.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="lore" element={<LoreCatalogPage />} />
          {/* One workspace layout for both, so the project sidebar stays mounted between them */}
          <Route element={<ProjectWorkspaceLayout />}>
            <Route path="lore/:entryId" element={<LoreDetailsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          </Route>
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="profile/:userId/:collection" element={<ProfileCollectionPage />} />

          {/* Logged-in users only */}
          <Route element={<AuthGuard />}>
            <Route path="lore/create" element={<CreateLorePage />} />
            <Route path="lore/:entryId/edit" element={<EditLorePage />} />
            <Route path="projects" element={<MyProjectsPage />} />
            <Route path="projects/create" element={<CreateProjectPage />} />
            <Route path="projects/:projectId/edit" element={<EditProjectPage />} />
            <Route path="constellation" element={<ConstellationPage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
          </Route>

          {/* Guests only */}
          <Route element={<GuestGuard />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

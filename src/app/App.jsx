import { Route, Routes } from "react-router";
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
import ProfilePage from "../features/profile/pages/ProfilePage.jsx";
import CreateProjectPage from "../features/projects/pages/CreateProjectPage.jsx";
import EditProjectPage from "../features/projects/pages/EditProjectPage.jsx";
import MyProjectsPage from "../features/projects/pages/MyProjectsPage.jsx";
import ProjectDetailsPage from "../features/projects/pages/ProjectDetailsPage.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="lore" element={<LoreCatalogPage />} />
        <Route path="lore/:entryId" element={<LoreDetailsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />

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
  );
}

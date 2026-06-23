import { Routes, Route } from "react-router-dom";
import { OwnerRoute } from "../components/auth/OwnerRoute";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/HomePage";
import { GalleryPage } from "../pages/GalleryPage";
import { RequestPage } from "../pages/RequestPage";
import { QuotePage } from "../pages/QuotePage";
import { OwnerLoginPage } from "../pages/OwnerLoginPage";
import { OwnerDashboardPage } from "../pages/OwnerDashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/quote/:token" element={<QuotePage />} />
        <Route path="/owner/login" element={<OwnerLoginPage />} />
        <Route path="/owner" element={<OwnerRoute><OwnerDashboardPage /></OwnerRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

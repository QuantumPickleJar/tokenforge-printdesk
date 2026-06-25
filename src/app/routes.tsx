import { Routes, Route, Navigate } from "react-router-dom";
import { OwnerRoute } from "../components/auth/OwnerRoute";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/HomePage";
import { GalleryPage } from "../pages/GalleryPage";
import { RequestPage } from "../pages/RequestPage";
import { QuotePage } from "../pages/QuotePage";
import { LoginPage } from "../pages/OwnerLoginPage";
import { OwnerDashboardPage } from "../pages/OwnerDashboardPage";
import { OwnerIntakePage } from "../pages/OwnerIntakePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/quote/:token" element={<QuotePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/owner/login" element={<Navigate to="/login?next=/owner" replace />} />
        <Route path="/owner" element={<OwnerRoute><OwnerDashboardPage /></OwnerRoute>} />
        <Route path="/owner/materials" element={<OwnerRoute><OwnerDashboardPage initialTab="materials" /></OwnerRoute>} />
        <Route path="/owner/intake" element={<OwnerIntakePage />} />
        <Route path="/generator" element={<Navigate to="/owner/intake" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

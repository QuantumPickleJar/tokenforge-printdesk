import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AppShell } from "../components/layout/AppShell";
import { TokenforgeIntakePage } from "../pages/TokenforgeIntakePage";

export function App() {
  return (
    <BrowserRouter basename="/tokenforge-printdesk">
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  if (location.pathname === "/generator") {
    return (
      <AppShell>
        <TokenforgeIntakePage />
      </AppShell>
    );
  }

  return <AppRoutes />;
}

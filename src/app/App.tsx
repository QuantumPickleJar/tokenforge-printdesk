import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./routes";
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
  return location.pathname === "/generator" ? <TokenforgeIntakePage /> : <AppRoutes />;
}

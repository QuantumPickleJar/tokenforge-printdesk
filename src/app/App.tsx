import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { TokenforgeIntakePage } from "../pages/TokenforgeIntakePage";

export function App() {
  const pathname = window.location.pathname;
  const showGeneratorHandoff = pathname.endsWith("/generator") || pathname.endsWith("/handoff") || pathname.endsWith("/intake");

  return (
    <BrowserRouter basename="/tokenforge-printdesk">
      {showGeneratorHandoff ? <TokenforgeIntakePage /> : <AppRoutes />}
    </BrowserRouter>
  );
}

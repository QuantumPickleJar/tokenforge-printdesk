import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <BrowserRouter basename="/tokenforge-printdesk">
      <AppRoutes />
    </BrowserRouter>
  );
}

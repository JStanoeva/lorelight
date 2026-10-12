import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* useTransitions={false}: a navigation shows the new page right away instead of as a
        low-priority update. Logout depends on it: Home must be on screen before the session
        is cleared, or AuthGuard would send the user to /login. */}
    <BrowserRouter useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

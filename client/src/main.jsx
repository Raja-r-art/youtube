import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Apply dark mode before render to avoid flash
const stored = JSON.parse(localStorage.getItem("ui-store") || "{}");
if (stored?.state?.darkMode !== false) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.info("BASE_URL", import.meta.env.BASE_URL);
console.info("ENV", {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "set" : "missing",
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "set" : "missing",
});

createRoot(document.getElementById("root")!).render(<App />);

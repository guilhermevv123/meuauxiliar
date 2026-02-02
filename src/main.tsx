import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { pingSupabase } from "./lib/supabaseHealth";
import logoFull from "@/assets/logo-full.png";

console.info("BASE_URL", import.meta.env.BASE_URL);
console.info("ENV", {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "set" : "missing",
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "set" : "missing",
});

pingSupabase();

try {
  const setFavicon = () => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = logoFull;
  };
  const setSocialImages = () => {
    const abs = new URL(logoFull, location.origin).toString();
    const og = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    const tw = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
    if (og) og.content = abs;
    if (tw) tw.content = abs;
  };
  setFavicon();
  setSocialImages();
} catch (e) {
  console.warn('favicon/social image update skipped:', e);
}

try {
  document.documentElement.classList.add('dark');
} catch {}

createRoot(document.getElementById("root")!).render(<App />);

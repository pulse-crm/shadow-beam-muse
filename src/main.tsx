import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.tsx';

// Apply persisted theme + dark mode before first paint to avoid a flash.
try {
  const root = document.documentElement;
  if (localStorage.getItem("app-dark-mode") === "true") root.classList.add("dark");
  const theme = localStorage.getItem("app-theme");
  if (theme && theme !== "default") root.classList.add(`theme-${theme}`);
} catch {
  /* storage may be unavailable */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

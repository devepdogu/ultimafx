"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

export type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "ultima-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

/** Reads the resolved theme straight off the DOM — the root layout's inline
 * bootstrap script (and `setTheme()` below) are the only things that ever set
 * `data-theme`, so this is always in sync with what's actually rendered. */
function getSnapshot(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "dark";
}

/** Current resolved theme; re-renders when the theme changes anywhere on the page. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("ultima-theme", next);
  } catch {
    // Best-effort — a blocked localStorage just means the choice won't persist.
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useTheme();

  return (
    <IconButton
      label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}

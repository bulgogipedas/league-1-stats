import { create } from "zustand";

const storageKey = "punditstat-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = mode;
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(storageKey);
  return stored === "dark" || stored === "light" ? stored : getSystemTheme();
}

export const useThemeStore = create((set, get) => ({
  mode: getInitialTheme(),
  resolved: getInitialTheme(),
  init: () => {
    const mode = get().mode;
    applyTheme(mode);
    set({ resolved: mode });
  },
  setMode: (mode) => {
    window.localStorage.setItem(storageKey, mode);
    applyTheme(mode);
    set({ mode, resolved: mode });
  },
  cycle: () => {
    const current = get().mode;
    get().setMode(current === "dark" ? "light" : "dark");
  },
}));

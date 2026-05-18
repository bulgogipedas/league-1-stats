import { create } from "zustand";

const storageKey = "punditstat-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode) {
  if (typeof document === "undefined") return;
  const resolved = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = mode;
}

export const useThemeStore = create((set, get) => ({
  mode: typeof window === "undefined" ? "system" : window.localStorage.getItem(storageKey) || "system",
  resolved: getSystemTheme(),
  init: () => {
    const mode = get().mode;
    const resolved = mode === "system" ? getSystemTheme() : mode;
    applyTheme(mode);
    set({ resolved });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const currentMode = get().mode;
      const nextResolved = currentMode === "system" ? getSystemTheme() : currentMode;
      applyTheme(currentMode);
      set({ resolved: nextResolved });
    };
    media.addEventListener?.("change", onChange);
  },
  setMode: (mode) => {
    window.localStorage.setItem(storageKey, mode);
    applyTheme(mode);
    set({ mode, resolved: mode === "system" ? getSystemTheme() : mode });
  },
  cycle: () => {
    const current = get().mode;
    get().setMode(current === "system" ? "dark" : current === "dark" ? "light" : "system");
  },
}));

import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import ErrorBoundary from "./components/layout/ErrorBoundary.jsx";
import { useThemeStore } from "./data/themeStore.js";

export default function App() {
  const initTheme = useThemeStore((state) => state.init);
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main className="mx-auto w-full max-w-[1584px] min-w-0 px-3 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

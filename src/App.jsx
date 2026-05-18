import { Outlet } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import ErrorBoundary from "./components/layout/ErrorBoundary.jsx";

export default function App() {
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

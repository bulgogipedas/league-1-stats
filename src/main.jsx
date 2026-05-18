import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import App from "./App.jsx";
import Overview from "./pages/Overview.jsx";
import MatchAnalysis from "./pages/MatchAnalysis.jsx";
import PlayerAnalytics from "./pages/PlayerAnalytics.jsx";
import TeamAnalysis from "./pages/TeamAnalysis.jsx";
import FormationAnalysis from "./pages/FormationAnalysis.jsx";
import "./styles/tokens.css";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/matches" element={<MatchAnalysis />} />
          <Route path="/players" element={<PlayerAnalytics />} />
          <Route path="/teams" element={<TeamAnalysis />} />
          <Route path="/formations" element={<FormationAnalysis />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

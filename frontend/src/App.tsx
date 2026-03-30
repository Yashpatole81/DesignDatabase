import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Builder from "./pages/Builder";
import Review from "./pages/Review";
import Result from "./pages/Result";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Dashboard />} />
          <Route path="builder" element={<Builder />} />
          <Route path="review" element={<Review />} />
          <Route path="result" element={<Result />} />
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Suppress harmless ResizeObserver loop limit exceeded error caused by React Flow in Vite overlay
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (e.message === "ResizeObserver loop limit exceeded" || e.message === "ResizeObserver loop completed with undelivered notifications.") {
      const resizeObserverErrDiv = document.getElementById("webpack-dev-server-client-overlay-div");
      const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay");
      if (resizeObserverErr) resizeObserverErr.setAttribute("style", "display: none");
      if (resizeObserverErrDiv) resizeObserverErrDiv.setAttribute("style", "display: none");
      // Stop Vite's error overlay
      e.stopImmediatePropagation();
    }
  });
}

export default App;

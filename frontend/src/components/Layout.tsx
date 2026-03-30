import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useSchemaStore } from "@/store/useSchemaStore";

export function Layout() {
  const location = useLocation();
  const { activeProjectId } = useSchemaStore();
  
  // If we are exactly at root, redirect to dashboard
  if (location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  // Prevent accessing builder/review without an active project
  if (!activeProjectId && (location.pathname.startsWith("/builder") || location.pathname.startsWith("/review"))) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto bg-muted/10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

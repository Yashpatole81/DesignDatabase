import { useSchemaStore } from "@/store/useSchemaStore";
import { User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { activeProjectId, projects } = useSchemaStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {activeProject ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{activeProject.name}</span>
            <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
              {activeProject.dbType}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No project selected</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

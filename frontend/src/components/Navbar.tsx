import { Button } from "@/components/ui/button";
import { useSchemaStore } from "@/store/useSchemaStore";
import { Sparkles, Save, Eye, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
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
        <Button variant="outline" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/review")}>
          <Eye className="w-4 h-4" />
          Review Schema
        </Button>
        <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 hover:opacity-90">
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
        
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ml-2 border">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

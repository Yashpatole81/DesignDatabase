import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSchemaStore } from "@/store/useSchemaStore";
import { useNavigate } from "react-router-dom";
import { ProjectCreationModal } from "@/components/ProjectCreationModal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projects, setActiveProject, deleteProject } = useSchemaStore();
  const navigate = useNavigate();

  const handleOpenProject = (id: string) => {
    setActiveProject(id);
    navigate("/builder");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your database schemas and AI generations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-md">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-xl line-clamp-1 flex-1">{project.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={project.dbType === "PostgreSQL" ? "default" : "secondary"}>
                    {project.dbType}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete Project"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this project?")) {
                        deleteProject(project.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <CardDescription className="pt-2">
                Last modified: {new Date(project.lastModified).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-24 rounded-md bg-muted/50 border border-dashed overflow-hidden relative p-2">
                {project.tables.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground/50 text-xs">No tables yet</div>
                ) : (
                  <div className="flex flex-wrap gap-1 overflow-hidden">
                    {project.tables.slice(0, 6).map(t => (
                      <div key={t.id} className="bg-primary/10 border border-primary/20 rounded px-2 py-1 text-xs font-medium text-primary truncate max-w-[80px]">
                        {t.name}
                      </div>
                    ))}
                    {project.tables.length > 6 && (
                      <div className="text-xs text-muted-foreground self-center">+{project.tables.length - 6} more</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full group-hover:bg-primary transition-colors"
                onClick={() => handleOpenProject(project.id)}
              >
                Open Builder
              </Button>
            </CardFooter>
          </Card>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center h-full min-h-[280px] rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-4">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-medium text-muted-foreground group-hover:text-foreground">Create New Project</span>
        </button>
      </div>

      <ProjectCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

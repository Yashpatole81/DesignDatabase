import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchemaStore } from "@/store/useSchemaStore";
import { useNavigate } from "react-router-dom";

export function ProjectCreationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [dbType, setDbType] = useState<"MySQL" | "PostgreSQL">("PostgreSQL");
  
  const { addProject, setActiveProject } = useSchemaStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject(name, dbType);
    
    // In a real app we'd wait for the store to update or get the returned ID
    // For now we can fake getting the latest project by assuming it's appended
    // A better way is state listener, but for this demo this is fine.
    setTimeout(() => {
      const state = useSchemaStore.getState();
      const newProject = state.projects[state.projects.length - 1];
      if (newProject) {
        setActiveProject(newProject.id);
        navigate("/builder");
      }
      onClose();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new database schema project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. E-Commerce Platform"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Database Type</Label>
              <Select value={dbType} onValueChange={(v: "MySQL" | "PostgreSQL") => setDbType(v)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

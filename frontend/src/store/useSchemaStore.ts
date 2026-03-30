import { create } from "zustand";

export type Column = {
  id: string;
  name: string;
  type: string;
  key?: "PK" | "FK" | "UNIQUE" | "NONE";
};

export type Table = {
  id: string;
  name: string;
  columns: Column[];
  position?: { x: number; y: number };
};

export type Relationship = {
  id: string;
  sourceTableId: string;
  targetTableId: string;
  sourceColumnId?: string;
  targetColumnId?: string;
};

export type AIOutput = {
  sql: string;
  explanation: string;
  warnings: string[];
};

export type Project = {
  id: string;
  name: string;
  dbType: "MySQL" | "PostgreSQL";
  lastModified: string;
};

interface SchemaState {
  // Global Project State
  projects: Project[];
  activeProjectId: string | null;
  
  // Current Active Project Schema
  tables: Table[];
  relationships: Relationship[];
  aiOutput: AIOutput | null;

  // Actions
  addProject: (name: string, dbType: "MySQL" | "PostgreSQL") => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  
  // Table Actions
  addTable: (table: Table) => void;
  updateTable: (id: string, updatedTable: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  
  // Relationship Actions
  addRelationship: (rel: Relationship) => void;
  deleteRelationship: (id: string) => void;

  // AI Actions
  setAIOutput: (output: AIOutput) => void;
  applyAISchema: (tables: Table[], relationships: Relationship[]) => void;
}

export const useSchemaStore = create<SchemaState>((set) => ({
  projects: [
    { id: "1", name: "E-Commerce Start", dbType: "PostgreSQL", lastModified: new Date().toISOString() }
  ],
  activeProjectId: null,
  
  tables: [],
  relationships: [],
  aiOutput: null,

  addProject: (name, dbType) => set((state) => ({
    projects: [...state.projects, {
      id: Math.random().toString(36).substring(7),
      name,
      dbType,
      lastModified: new Date().toISOString()
    }]
  })),

  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
  })),

  setActiveProject: (id) => set({ activeProjectId: id }),

  addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
  
  updateTable: (id, updatedTable) => set((state) => ({
    tables: state.tables.map(t => typeof t === "object" && t.id === id ? { ...t, ...updatedTable } : t)
  })),
  
  deleteTable: (id) => set((state) => ({
    tables: state.tables.filter(t => t.id !== id),
    relationships: state.relationships.filter(r => r.sourceTableId !== id && r.targetTableId !== id)
  })),

  updateTablePosition: (id, position) => set((state) => ({
    tables: state.tables.map(t => t.id === id ? { ...t, position } : t)
  })),

  addRelationship: (rel) => set((state) => ({
    relationships: [...state.relationships, rel]
  })),

  deleteRelationship: (id) => set((state) => ({
    relationships: state.relationships.filter(r => r.id !== id)
  })),

  setAIOutput: (output) => set({ aiOutput: output }),

  applyAISchema: (tables, relationships) => set({ tables, relationships }),
}));

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

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
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
  tables: Table[];
  relationships: Relationship[];
  aiOutput: AIOutput | null;
  messages: Message[];
};

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "ai",
  content: "Hi! I'm your AI Database Architect. How can I help you design your schema today?",
};

interface SchemaState {
  projects: Project[];
  activeProjectId: string | null;

  tables: Table[];
  relationships: Relationship[];
  aiOutput: AIOutput | null;
  messages: Message[];
  isTyping: boolean;

  addProject: (name: string, dbType: "MySQL" | "PostgreSQL") => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;

  addTable: (table: Table) => void;
  updateTable: (id: string, updatedTable: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;

  addRelationship: (rel: Relationship) => void;
  deleteRelationship: (id: string) => void;

  setAIOutput: (output: AIOutput) => void;
  applyAISchema: (tables: Table[], relationships: Relationship[]) => void;
  addMessage: (message: Message) => void;
  setIsTyping: (val: boolean) => void;
}

function syncActiveProject(projects: Project[], activeProjectId: string | null) {
  const active = projects.find(p => p.id === activeProjectId);
  return {
    tables: active?.tables ?? [],
    relationships: active?.relationships ?? [],
    aiOutput: active?.aiOutput ?? null,
    messages: active?.messages ?? [INITIAL_MESSAGE],
  };
}

function updateProject(projects: Project[], id: string, patch: Partial<Project>): Project[] {
  return projects.map(p => p.id === id ? { ...p, ...patch, lastModified: new Date().toISOString() } : p);
}

export const useSchemaStore = create<SchemaState>((set) => ({
  projects: [
    { id: "1", name: "E-Commerce Start", dbType: "PostgreSQL", lastModified: new Date().toISOString(), tables: [], relationships: [], aiOutput: null, messages: [INITIAL_MESSAGE] }
  ],
  activeProjectId: null,
  tables: [],
  relationships: [],
  aiOutput: null,
  messages: [INITIAL_MESSAGE],
  isTyping: false,

  addProject: (name, dbType) => set((state) => {
    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name,
      dbType,
      lastModified: new Date().toISOString(),
      tables: [],
      relationships: [],
      aiOutput: null,
      messages: [INITIAL_MESSAGE],
    };
    return { projects: [...state.projects, newProject] };
  }),

  deleteProject: (id) => set((state) => {
    const projects = state.projects.filter(p => p.id !== id);
    const activeProjectId = state.activeProjectId === id ? null : state.activeProjectId;
    return { projects, activeProjectId, ...syncActiveProject(projects, activeProjectId) };
  }),

  setActiveProject: (id) => set((state) => ({
    activeProjectId: id,
    ...syncActiveProject(state.projects, id),
  })),

  addTable: (table) => set((state) => {
    if (!state.activeProjectId) return {};
    const tables = [...state.tables, table];
    const projects = updateProject(state.projects, state.activeProjectId, { tables });
    return { tables, projects };
  }),

  updateTable: (id, updatedTable) => set((state) => {
    if (!state.activeProjectId) return {};
    const tables = state.tables.map(t => t.id === id ? { ...t, ...updatedTable } : t);
    const projects = updateProject(state.projects, state.activeProjectId, { tables });
    return { tables, projects };
  }),

  deleteTable: (id) => set((state) => {
    if (!state.activeProjectId) return {};
    const tables = state.tables.filter(t => t.id !== id);
    const relationships = state.relationships.filter(r => r.sourceTableId !== id && r.targetTableId !== id);
    const projects = updateProject(state.projects, state.activeProjectId, { tables, relationships });
    return { tables, relationships, projects };
  }),

  updateTablePosition: (id, position) => set((state) => {
    if (!state.activeProjectId) return {};
    const tables = state.tables.map(t => t.id === id ? { ...t, position } : t);
    const projects = updateProject(state.projects, state.activeProjectId, { tables });
    return { tables, projects };
  }),

  addRelationship: (rel) => set((state) => {
    if (!state.activeProjectId) return {};
    const relationships = [...state.relationships, rel];
    const projects = updateProject(state.projects, state.activeProjectId, { relationships });
    return { relationships, projects };
  }),

  deleteRelationship: (id) => set((state) => {
    if (!state.activeProjectId) return {};
    const relationships = state.relationships.filter(r => r.id !== id);
    const projects = updateProject(state.projects, state.activeProjectId, { relationships });
    return { relationships, projects };
  }),

  setAIOutput: (output) => set((state) => {
    if (!state.activeProjectId) return {};
    const projects = updateProject(state.projects, state.activeProjectId, { aiOutput: output });
    return { aiOutput: output, projects };
  }),

  applyAISchema: (tables, relationships) => set((state) => {
    if (!state.activeProjectId) return {};
    const projects = updateProject(state.projects, state.activeProjectId, { tables, relationships });
    return { tables, relationships, projects };
  }),

  addMessage: (message) => set((state) => {
    if (!state.activeProjectId) return {};
    const messages = [...state.messages, message];
    const projects = updateProject(state.projects, state.activeProjectId, { messages });
    return { messages, projects };
  }),

  setIsTyping: (val) => set({ isTyping: val }),
}));

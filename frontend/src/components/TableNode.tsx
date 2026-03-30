import { Handle, Position } from "reactflow";
import { Key, Trash2 } from "lucide-react";
import type { Column } from "@/store/useSchemaStore";

interface TableNodeProps {
  data: {
    id: string;
    name: string;
    columns: Column[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  };
}

export default function TableNode({ data }: TableNodeProps) {
  return (
    <div 
      className="bg-card border-2 border-border rounded-xl shadow-lg w-64"
      onDoubleClick={() => data.onEdit(data.id)}
    >

      {/* Header */}
      <div className="bg-primary px-4 py-2 flex items-center justify-between text-primary-foreground rounded-t-[10px]">
        <span className="font-bold text-sm tracking-wide flex-1">{data.name}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete table "${data.name}"?`)) {
              data.onDelete(data.id);
            }
          }}
          className="text-primary-foreground/70 hover:text-destructive-foreground hover:bg-destructive/90 rounded-md p-1 transition-colors"
          title="Delete Table"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Columns */}
      <div className="flex flex-col py-1">
        {data.columns.map((col) => (
          <div key={col.id} className="flex flex-col relative group px-4 py-1.5 hover:bg-muted/50 transition-colors">
            {/* Target Handle (Left) - for incoming connections */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={col.id} 
              className={`w-3 h-3 border-2 border-background transition-opacity z-10 ${col.key === 'FK' ? '!bg-blue-500 opacity-100' : '!bg-muted-foreground opacity-20 group-hover:opacity-100'} left-0 ml-[-6px]`} 
            />
            
            {/* Source Handle (Right) - for outgoing connections */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={col.id} 
              className={`w-3 h-3 border-2 border-background transition-opacity z-10 ${col.key === 'PK' ? '!bg-yellow-500 opacity-100' : '!bg-primary opacity-20 group-hover:opacity-100'} right-0 mr-[-6px]`} 
            />

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {col.key === "PK" && <Key className="w-3 h-3 text-yellow-500 shrink-0" />}
                {col.key === "FK" && <Key className="w-3 h-3 text-blue-500 shrink-0" />}
                {col.key === "UNIQUE" && <span className="w-3 text-[10px] font-bold text-green-500 shrink-0">U</span>}
                {(!col.key || col.key === "NONE") && <span className="w-3 shrink-0" />}
                <span className="font-medium font-mono text-foreground">{col.name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">{col.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

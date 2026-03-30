import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";
import type {
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import TableNode from "./TableNode";
import { useSchemaStore } from "@/store/useSchemaStore";

interface SchemaCanvasProps {
  onEditTable: (id: string) => void;
}

export default function SchemaCanvas({ onEditTable }: SchemaCanvasProps) {
  const { tables, relationships, updateTablePosition, addRelationship, deleteRelationship, deleteTable } = useSchemaStore();
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());

  const nodeTypes = useMemo(() => ({
    tableNode: TableNode,
  }), []);

  // Convert store tables to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return tables.map((t) => ({
      id: t.id,
      type: "tableNode",
      position: t.position || { x: 0, y: 0 },
      data: {
        id: t.id,
        name: t.name,
        columns: t.columns,
        onEdit: onEditTable,
        onDelete: deleteTable,
      },
    }));
  }, [tables, onEditTable, deleteTable]);

  // Convert store relationships to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return relationships.map((r) => {
      const isSelected = selectedEdgeIds.has(r.id);
      return {
        id: r.id,
        source: r.sourceTableId,
        sourceHandle: r.sourceColumnId,
        target: r.targetTableId,
        targetHandle: r.targetColumnId,
        type: 'smoothstep',
        selected: isSelected,
        animated: isSelected,
        style: { stroke: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
        },
      };
    });
  }, [relationships, selectedEdgeIds]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Just handle position changes explicitly by updating store
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          updateTablePosition(change.id, change.position);
        }
        if (change.type === "remove") {
          deleteTable(change.id);
        }
      }
    },
    [updateTablePosition, deleteTable]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === "remove") {
          deleteRelationship(change.id);
        }
        if (change.type === "select") {
          setSelectedEdgeIds(prev => {
            const next = new Set(prev);
            if (change.selected) next.add(change.id);
            else next.delete(change.id);
            return next;
          });
        }
      }
    },
    [deleteRelationship]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // Don't allow self-connections
      if (connection.source === connection.target) return;
      
      addRelationship({
        id: `rel-${Date.now()}`,
        sourceTableId: connection.source || "",
        targetTableId: connection.target || "",
        sourceColumnId: connection.sourceHandle || undefined,
        targetColumnId: connection.targetHandle || undefined,
      });
    },
    [addRelationship]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-muted/10"
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap zoomable pannable 
          nodeColor={() => "hsl(var(--primary))"}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
}

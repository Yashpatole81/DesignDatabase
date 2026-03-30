import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchemaStore } from "@/store/useSchemaStore";
import type { Column } from "@/store/useSchemaStore";

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string | null; // If null, creates new table. If provides ID, edits existing.
}

const DATA_TYPES = ["INTEGER", "VARCHAR(255)", "TEXT", "BOOLEAN", "DATE", "TIMESTAMP", "DECIMAL", "JSONB", "UUID"];
const KEY_TYPES = ["NONE", "PK", "FK", "UNIQUE"];

export function TableModal({ isOpen, onClose, tableId }: TableModalProps) {
  const { tables, addTable, updateTable } = useSchemaStore();
  
  const [name, setName] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (tableId) {
        const existingTable = tables.find(t => t.id === tableId);
        if (existingTable) {
          setName(existingTable.name);
          setColumns(existingTable.columns);
        }
      } else {
        setName("");
        setColumns([
          { id: Math.random().toString(), name: "id", type: "INTEGER", key: "PK" }
        ]);
      }
    }
  }, [isOpen, tableId, tables]);

  const handleAddColumn = () => {
    setColumns([...columns, { id: Math.random().toString(), name: "new_column", type: "VARCHAR(255)", key: "NONE" }]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const handleUpdateColumn = (id: string, field: keyof Column, value: string) => {
    setColumns(columns.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const formattedName = name.toLowerCase().replace(/\s+/g, "_");

    // Check for duplicate table name
    const isDuplicate = tables.some(
      t => t.name.toLowerCase() === formattedName && t.id !== tableId
    );

    if (isDuplicate) {
      setError(`A table named "${formattedName}" already exists.`);
      return;
    }

    if (tableId) {
      updateTable(tableId, { name: formattedName, columns });
    } else {
      addTable({
        id: Math.random().toString(),
        name: formattedName,
        columns,
        position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 }
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{tableId ? "Edit Table" : "Create New Table"}</DialogTitle>
          <DialogDescription>
            Define the table name, columns, data types, and constraints.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 overflow-y-auto flex-1 pr-2">
          <div className="grid gap-2">
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null); // Clear error on edit
              }}
              placeholder="users"
              className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Columns</Label>
            </div>
            
            <div className="space-y-2">
              {columns.map((col) => (
                <div key={col.id} className="flex items-center gap-2 group">
                  <Input 
                    value={col.name} 
                    onChange={(e) => handleUpdateColumn(col.id, "name", e.target.value)}
                    className="flex-1"
                    placeholder="column_name"
                  />
                  
                  <Select value={col.type} onValueChange={(v) => handleUpdateColumn(col.id, "type", v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map(dt => (
                        <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={col.key || "NONE"} onValueChange={(v) => handleUpdateColumn(col.id, "key", v)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_TYPES.map(kt => (
                        <SelectItem key={kt} value={kt}>{kt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleRemoveColumn(col.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="mt-3 w-full border-dashed gap-2" onClick={handleAddColumn}>
              <Plus className="w-4 h-4" />
              Add Column
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save Table</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

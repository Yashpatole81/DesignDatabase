import { useState } from "react";
import { Plus, Wand2, Play, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { TableModal } from "@/components/TableModal";
import { ValidationPanel } from "@/components/ValidationPanel";
import SchemaCanvas from "../components/SchemaCanvas";
import { useNavigate } from "react-router-dom";
import { useSchemaStore } from "@/store/useSchemaStore";

export default function Builder() {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { tables, updateTablePosition } = useSchemaStore();

  const handleAutoLayout = () => {
    const COLS = 3;
    const X_GAP = 320;
    const Y_GAP = 280;
    tables.forEach((table, i) => {
      updateTablePosition(table.id, {
        x: (i % COLS) * X_GAP + 50,
        y: Math.floor(i / COLS) * Y_GAP + 50,
      });
    });
  };

  const handleNewTable = () => {
    setEditingTableId(null);
    setIsTableModalOpen(true);
  };

  const handleEditTable = (id: string) => {
    setEditingTableId(id);
    setIsTableModalOpen(true);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar - Table List */}
      <div className={`border-r bg-card flex flex-col h-full z-10 shadow-sm shrink-0 transition-all duration-300 ${isLeftSidebarOpen ? "w-64" : "w-14"}`}>
        <div className={`flex items-center h-14 shrink-0 border-b ${isLeftSidebarOpen ? "p-4 justify-between" : "justify-center"}`}>
          {isLeftSidebarOpen ? (
            <>
              <h3 className="font-semibold">Tables ({tables.length})</h3>
              <div className="flex items-center">
                <Button size="icon" variant="ghost" onClick={handleNewTable} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsLeftSidebarOpen(false)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button size="icon" variant="ghost" onClick={() => setIsLeftSidebarOpen(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Expand Tables List">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isLeftSidebarOpen ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-1 fade-in-0 animate-in">
            {tables.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground mt-10">
                No tables yet.<br/>Click + to create one, or use the AI Assistant.
              </div>
            ) : (
              tables.map(table => (
                <button 
                  key={table.id}
                  onClick={() => handleEditTable(table.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    <span className="font-medium truncate">{table.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">
                    {table.columns.length} cols
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center pt-4 gap-4 fade-in-0 animate-in">
            <Button size="icon" variant="ghost" onClick={handleNewTable} className="h-10 w-10 text-muted-foreground border shadow-sm hover:text-primary bg-background" title="Add New Table">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Center Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#121212] relative overflow-hidden">
        {/* Builder Toolbar */}
        <div className="h-14 border-b bg-card/50 backdrop-blur-sm absolute top-0 w-full z-10 flex items-center justify-between px-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm" onClick={handleNewTable}>
              <Plus className="w-4 h-4" />
              Add Table
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm" onClick={handleAutoLayout}>
              <Wand2 className="w-4 h-4" />
              Auto Layout
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-background shadow-sm text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => setIsValidationOpen(true)}
            >
              <CheckCircle2 className="w-4 h-4" />
              Validate
            </Button>
          </div>
          
          <Button size="sm" onClick={() => navigate("/review")} className="gap-2 shadow-md">
            <Play className="w-4 h-4" />
            Proceed to Review
          </Button>
        </div>

        {/* React Flow Canvas Wrapper */}
        <div className="flex-1 w-full h-full pt-14">
          <SchemaCanvas onEditTable={handleEditTable} />
        </div>
      </div>

      {/* Right AI Sidebar */}
      <ChatPanel />

      <TableModal 
        isOpen={isTableModalOpen} 
        onClose={() => setIsTableModalOpen(false)} 
        tableId={editingTableId} 
      />
      <ValidationPanel 
        isOpen={isValidationOpen} 
        onClose={() => setIsValidationOpen(false)} 
      />
    </div>
  );
}

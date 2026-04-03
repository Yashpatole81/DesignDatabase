import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchemaStore } from "@/store/useSchemaStore";
import Editor from "@monaco-editor/react";
import SchemaCanvas from "../components/SchemaCanvas";
import { useState } from "react";

export default function Review() {
  const navigate = useNavigate();
  const { aiOutput } = useSchemaStore();
  const [isExplanationMinimized, setIsExplanationMinimized] = useState(false);

  const sql = aiOutput?.sql || "-- No SQL available yet.\n-- Use the AI Assistant to generate a schema.";
  const projectName = useSchemaStore.getState().projects.find(p => p.id === useSchemaStore.getState().activeProjectId)?.name || "schema";

  const handleApprove = () => {
    // Generate and download the SQL file
    const blob = new Blob([sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/\s+/g, "_")}_schema.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    navigate("/result");
  };

  return (
    <div className="flex h-full w-full overflow-hidden flex-col bg-background">
      {/* Top Bar */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/builder")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Review Schema</h1>
            <p className="text-xs text-muted-foreground">Verify the generated SQL and visual architecture before exporting.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/builder")} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Edit with AI
          </Button>
          <Button onClick={handleApprove} className="gap-2 shadow-md bg-green-600 hover:bg-green-700 text-white">
            <Check className="w-4 h-4" />
            Approve & Download SQL
          </Button>
        </div>
      </div>

      {/* Split Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Schema Canvas Readonly */}
        <div className="flex-1 border-r relative bg-[#f8f9fa] dark:bg-[#121212]">
          <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-md border shadow-sm text-sm font-medium">
            Visual Architecture Preview
          </div>
          <SchemaCanvas onEditTable={() => {}} />
        </div>

        {/* Right: SQL Preview & Explanation */}
        <div className="w-[45%] flex flex-col bg-card h-full">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              Generated Query
            </h2>
          </div>
          <div className={`border-b transition-all ${isExplanationMinimized ? 'flex-1' : 'h-1/2'}`}>
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={sql}
              options={{ 
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'ui-monospace, Consolas, monospace',
                padding: { top: 16 }
              }}
            />
          </div>
          
          <div className={`overflow-hidden bg-muted/10 transition-all flex flex-col ${isExplanationMinimized ? 'h-auto' : 'flex-1'}`}>
            <div className="p-4 border-b bg-card flex items-center justify-between cursor-pointer hover:bg-muted/20 shrink-0" onClick={() => setIsExplanationMinimized(!isExplanationMinimized)}>
              <h3 className="font-semibold text-lg">AI Explanation</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isExplanationMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
            
            {!isExplanationMinimized && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiOutput?.explanation || "No explanation provided. Try using the AI Assistant in the Schema Builder to generate an explanation alongside your schema."}
                  </p>
                </div>

                {aiOutput?.warnings && aiOutput.warnings.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                    <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Warnings ({aiOutput.warnings.length})
                    </h3>
                    <ul className="text-sm text-destructive/80 space-y-1 ml-6 list-disc">
                      {aiOutput.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

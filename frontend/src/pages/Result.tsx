import { useNavigate } from "react-router-dom";
import { CheckCircle, Database, Sparkles, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchemaStore } from "@/store/useSchemaStore";

export default function Result() {
  const navigate = useNavigate();
  const { tables } = useSchemaStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 bg-background relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-4 border-white dark:border-background shadow-xl">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Schema Exported Successfully!</h1>
          <p className="text-lg text-muted-foreground">
            Your database architecture has been successfully converted to SQL. 
            Included {tables.length} tables with all constraints and indices.
          </p>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden text-left max-w-md mx-auto">
          <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2 font-medium">
            <Database className="w-4 h-4 text-primary" />
            Exported Tables
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {tables.length === 0 ? (
              <span className="text-sm text-muted-foreground">No tables created.</span>
            ) : (
              tables.map(t => (
                <div key={t.id} className="bg-background border rounded-md px-3 py-1.5 text-sm font-mono flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  {t.name}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-6 border-t flex flex-col gap-4">
          <h3 className="font-medium text-foreground">Suggested Next Steps</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-4 px-4 flex flex-col items-center gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate("/dashboard")}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Database className="w-4 h-4 text-foreground group-hover:text-primary" />
              </div>
              <span className="font-medium">Go to Dashboard</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 px-4 flex flex-col items-center gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 group">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Code2 className="w-4 h-4 text-foreground group-hover:text-primary" />
              </div>
              <span className="font-medium">Export raw SQL</span>
            </Button>
          </div>
          
          <Button className="w-full h-12 mt-4 gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-lg" onClick={() => navigate("/builder")}>
            <Sparkles className="w-4 h-4" />
            Continue building with AI
          </Button>
        </div>
      </div>
    </div>
  );
}

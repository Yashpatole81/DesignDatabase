import { AlertCircle, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSchemaStore } from "@/store/useSchemaStore";
import { useMemo } from "react";

interface ValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValidationPanel({ isOpen, onClose }: ValidationPanelProps) {
  const { tables, relationships, aiOutput } = useSchemaStore();

  const { errors, warnings } = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (tables.length === 0) {
      errors.push("Schema is empty. Add at least one table.");
      return { errors, warnings };
    }

    const tableIds = new Set(tables.map(t => t.id));

    tables.forEach(table => {
      const hasPK = table.columns.some(c => c.key === "PK");
      if (!hasPK) errors.push(`Table '${table.name}' is missing a primary key.`);
      if (table.columns.length === 0) errors.push(`Table '${table.name}' has no columns.`);

      const colNames = table.columns.map(c => c.name.toLowerCase());
      const dupes = colNames.filter((n, i) => colNames.indexOf(n) !== i);
      if (dupes.length > 0) errors.push(`Table '${table.name}' has duplicate column: '${dupes[0]}'.`);

      if (table.columns.length === 1) warnings.push(`Table '${table.name}' has only one column.`);
    });

    relationships.forEach(rel => {
      if (!tableIds.has(rel.sourceTableId)) errors.push(`Relationship references missing source table.`);
      if (!tableIds.has(rel.targetTableId)) errors.push(`Relationship references missing target table.`);
    });

    // Append backend warnings from AI output
    if (aiOutput?.warnings) {
      aiOutput.warnings.forEach(w => warnings.push(w));
    }

    return { errors, warnings };
  }, [tables, relationships, aiOutput]);

  const isValid = errors.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isValid ? "text-green-600" : "text-destructive"}`}>
            {isValid
              ? <><CheckCircle2 className="w-5 h-5" /> Schema is Valid</>
              : <><AlertCircle className="w-5 h-5" /> Schema Validation Issues</>
            }
          </DialogTitle>
          <DialogDescription>
            {isValid
              ? `All ${tables.length} tables passed validation.`
              : "Fix the issues below before proceeding."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {errors.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                Critical Errors ({errors.length})
              </h4>
              <div className="space-y-2">
                {errors.map((err, i) => (
                  <div key={i} className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{err}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Warnings ({warnings.length})
              </h4>
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm px-3 py-2 rounded-md">
                    <p>{w}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isValid && warnings.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No issues found. Your schema looks great!
            </div>
          )}
        </div>

        {!isValid && (
          <div className="bg-muted p-4 rounded-xl flex items-center justify-between border mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Let AI Fix This</p>
                <p className="text-xs text-muted-foreground">Use the AI Assistant to resolve schema errors.</p>
              </div>
            </div>
            <Button size="sm" className="gap-2 shrink-0 pr-2" onClick={onClose}>
              Open AI
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

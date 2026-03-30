import { AlertCircle, ArrowRight, ServerCrash, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValidationPanel({ isOpen, onClose }: ValidationPanelProps) {
  // Mock validation data
  const errors = [
    { message: "Table 'orders' is missing a primary key", type: "error" },
    { message: "Foreign key in 'order_items' references non-existent table 'products'", type: "error" }
  ];

  const suggestions = [
    { message: "Consider adding an index to 'user_id' in 'orders'", type: "warning" },
    { message: "Table 'user_profiles' could be merged with 'users' for better performance", type: "info" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ServerCrash className="w-5 h-5" />
            Schema Validation Issues
          </DialogTitle>
          <DialogDescription>
            We detected a few potential structural problems with your database schema.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Errors List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Critical Errors ({errors.length})
            </h4>
            <div className="space-y-2">
              {errors.map((err, i) => (
                <div key={i} className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{err.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Suggestions & Warnings ({suggestions.length})
            </h4>
            <div className="space-y-2">
              {suggestions.map((sug, i) => (
                <div key={i} className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm px-3 py-2 rounded-md">
                  <p>{sug.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-xl flex items-center justify-between border mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Let AI Fix This</p>
              <p className="text-xs text-muted-foreground">Automatically resolve schema errors.</p>
            </div>
          </div>
          <Button size="sm" className="gap-2 shrink-0 pr-2">
            Auto-Fix
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

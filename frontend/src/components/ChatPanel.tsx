import { useRef, useState, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchemaStore } from "@/store/useSchemaStore";

const SUGGESTIONS = [
  "Expand this to e-commerce schema",
  "Add payments system",
  "Normalize schema",
];

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;
const COLLAPSED_WIDTH = 56;

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [width, setWidth] = useState(320);
  const isResizing = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, addMessage, setAIOutput, applyAISchema, isTyping, setIsTyping } = useSchemaStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
    };

    const onMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;

    addMessage({ id: Date.now().toString(), role: "user", content: text });
    setInput("");
    setIsTyping(true);

    const currentSchema = useSchemaStore.getState();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    fetch(`${apiUrl}/api/v1/ai/generate-schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schema_design: {
          tables: currentSchema.tables,
          relationships: currentSchema.relationships,
        },
        prompt: text,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.detail) throw new Error(data.detail);

        addMessage({ id: Date.now().toString(), role: "ai", content: data.explanation });

        setAIOutput({
          sql: data.sql.join("\n"),
          explanation: data.explanation,
          warnings: data.warnings,
        });

        if (data.tables && data.tables.length > 0) {
          applyAISchema(data.tables, data.relationships);
        }
      })
      .catch(err => {
        addMessage({
          id: Date.now().toString(),
          role: "ai",
          content: `Error: ${err.message || "Failed to connect to AI server."}`,
        });
      })
      .finally(() => setIsTyping(false));
  };

  return (
    <div
      style={{ width: isExpanded ? width : COLLAPSED_WIDTH }}
      className="border-l bg-card flex flex-col h-full shadow-lg z-10 relative shrink-0"
    >
      {/* Resize handle */}
      {isExpanded && (
        <div
          onMouseDown={onMouseDown}
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-20"
        />
      )}

      {/* Header */}
      <div className={`border-b flex items-center shrink-0 h-14 ${isExpanded ? "p-4 justify-between" : "justify-center px-0"}`}>
        {isExpanded ? (
          <>
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="w-5 h-5 text-primary" />
              AI Assistant
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsExpanded(false)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsExpanded(true)} title="Expand AI Assistant">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isExpanded ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`rounded-xl px-4 py-2 text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
                <div className="rounded-xl px-4 py-3 bg-muted flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-muted/30">
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map(sugg => (
                <button
                  key={sugg}
                  onClick={() => handleSend(sugg)}
                  disabled={isTyping}
                  className="text-xs bg-background border px-2 py-1 rounded-full text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {sugg}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to modify schema..."
                className="pr-10 bg-background"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:text-primary"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-start pt-4 gap-4 bg-muted/10">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary bg-background shadow-sm border" title="New AI Prompt">
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary bg-background shadow-sm border" title="View Chat History">
            <Bot className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

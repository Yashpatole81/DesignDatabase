import { useState } from "react";
import { Send, Bot, User, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchemaStore } from "@/store/useSchemaStore";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const SUGGESTIONS = [
  "Expand this to e-commerce schema",
  "Add payments system",
  "Normalize schema",
];

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Hi! I'm your AI Database Architect. How can I help you design your schema today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { setAIOutput } = useSchemaStore();

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    // Real API Call
    const currentSchema = useSchemaStore.getState();
    
    fetch("http://localhost:8000/api/v1/ai/generate-schema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schema_design: {
          tables: currentSchema.tables,
          relationships: currentSchema.relationships
        },
        prompt: text
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.detail) throw new Error(data.detail);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: data.explanation
      }]);
      
      setAIOutput({
        sql: data.sql.join("\n"),
        explanation: data.explanation,
        warnings: data.warnings
      });
      
      // Update the actual visual canvas
      if (data.tables && data.tables.length > 0) {
        useSchemaStore.getState().applyAISchema(data.tables, data.relationships);
      }
    })
    .catch(err => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: `Error: ${err.message || "Failed to connect to AI server."}`
      }]);
    })
    .finally(() => {
      setIsTyping(false);
    });
  };

  return (
    <div className={`border-l bg-card flex flex-col h-full shadow-lg z-10 transition-all duration-300 ${isExpanded ? "w-80" : "w-14"}`}>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 fade-in-0 animate-in">
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
      </div>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map(sugg => (
            <button 
              key={sugg} 
              onClick={() => handleSend(sugg)}
              className="text-xs bg-background border px-2 py-1 rounded-full text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
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
        <div className="flex-1 flex flex-col items-center justify-start pt-4 gap-4 bg-muted/10 opacity-100 fade-in-0 animate-in">
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

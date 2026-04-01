import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, Network, ChevronLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSchemaStore } from "@/store/useSchemaStore";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresProject: false },
  { name: "Schema Builder", href: "/builder", icon: Network, requiresProject: true },
  { name: "Review", href: "/review", icon: Activity, requiresProject: true },
];

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { activeProjectId } = useSchemaStore();

  return (
    <div className={cn(
      "bg-card border-r flex flex-col h-full transition-all duration-300 shrink-0",
      isExpanded ? "w-64" : "w-16"
    )}>
      <div className={cn(
        "border-b flex items-center h-[76px]",
        isExpanded ? "px-6 justify-between" : "justify-center"
      )}>
        {isExpanded ? (
          <>
            <h2 className="text-xl font-bold tracking-tight truncate pr-2">AI DB Architect</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0" title="Expand Sidebar">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className={cn(
        "flex-1 space-y-1 overflow-y-auto overflow-x-hidden",
        isExpanded ? "p-4" : "p-2 pt-4"
      )}>
        {navItems.filter(item => !item.requiresProject || activeProjectId).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              title={!isExpanded ? item.name : undefined}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

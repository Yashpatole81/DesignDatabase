import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-8 h-8 rounded-full transition-all duration-300 hover:bg-muted"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-muted-foreground transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-muted-foreground transition-transform duration-300 hover:rotate-45" />
      )}
    </Button>
  );
}

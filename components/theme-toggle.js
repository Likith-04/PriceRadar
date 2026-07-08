"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
      className="relative border-border/70 bg-background/80 shadow-sm backdrop-blur-sm"
    >
      <Sun className="size-4 transition-all dark:scale-0 dark:rotate-90 dark:opacity-0" />
      <Moon className="absolute size-4 scale-0 -rotate-90 opacity-0 transition-all dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </Button>
  );
}

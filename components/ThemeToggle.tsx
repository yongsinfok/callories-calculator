"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { Theme } from "@/components/providers/ThemeProvider";

const THEME_CONFIG: Record<
  Theme,
  { icon: React.ReactNode; label: string; next: Theme }
> = {
  light: { icon: <Sun className="w-5 h-5" />, label: "浅色", next: "dark" },
  dark: { icon: <Moon className="w-5 h-5" />, label: "深色", next: "system" },
  system: { icon: <Monitor className="w-5 h-5" />, label: "跟随系统", next: "light" },
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const config = THEME_CONFIG[theme];

  return (
    <button
      onClick={() => setTheme(config.next)}
      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-background-dark-secondary flex items-center justify-center transition-colors"
      aria-label={`当前主题: ${config.label}, 点击切换`}
    >
      {config.icon}
    </button>
  );
}

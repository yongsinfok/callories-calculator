"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") return <Sun className="w-5 h-5" />;
    if (theme === "dark") return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === "light") return "浅色";
    if (theme === "dark") return "深色";
    return "跟随系统";
  };

  return (
    <button
      onClick={cycleTheme}
      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-background-dark-secondary flex items-center justify-center transition-colors"
      aria-label={`当前主题: ${getLabel()}, 点击切换`}
    >
      {getIcon()}
    </button>
  );
}

"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getConfidenceLevel } from "../types";

interface ConfidenceBadgeProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "default" | "minimal";
}

export function ConfidenceBadge({
  confidence,
  size = "sm",
  showLabel = true,
  variant = "default",
}: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(confidence);

  const styles = {
    high: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "信心: 高",
    },
    medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "信心: 中",
    },
    low: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "信心: 低 ⚠️",
    },
  };

  const style = styles[level];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  if (variant === "minimal") {
    return (
      <span
        className={`inline-flex items-center rounded-full ${style.bg} ${style.text} ${sizeStyles[size]}`}
      >
        {style.icon}
        {showLabel && <span>{style.label}</span>}
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeStyles[size]}`}
    >
      {style.icon}
      {showLabel && <span className="font-medium">{style.label}</span>}
    </motion.div>
  );
}

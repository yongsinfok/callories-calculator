"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getConfidenceLevel } from "../types";

interface EditableValueProps {
  value: number;
  confidence: number;
  unit: string;
  onSave: (newValue: number) => void;
  inputMode?: "decimal" | "numeric";
  min?: number;
  max?: number;
  decimals?: number;
  label?: string;
  showUnit?: boolean;
  highlighted?: boolean;
}

const CONFIDENCE_COLORS = {
  low: "text-amber-600 dark:text-amber-400",
  medium: "text-amber-500 dark:text-amber-500",
  normal: "text-gray-700 dark:text-text-dark-primary",
} as const;

const CONFIDENCE_BG = {
  low: "bg-amber-50 dark:bg-amber-900/20",
} as const;

function getConfidenceColor(
  level: ReturnType<typeof getConfidenceLevel>,
  highlighted: boolean
): string {
  if (level === "low") return CONFIDENCE_COLORS.low;
  if (level === "medium") return CONFIDENCE_COLORS.medium;
  if (highlighted) return CONFIDENCE_COLORS.low;
  return CONFIDENCE_COLORS.normal;
}

function getConfidenceBg(
  level: ReturnType<typeof getConfidenceLevel>,
  highlighted: boolean
): string {
  if (level === "low" || highlighted) return CONFIDENCE_BG.low;
  return "";
}

export function EditableValue({
  value,
  confidence,
  unit,
  onSave,
  inputMode = "decimal",
  min = 0,
  max = 10000,
  decimals = 0,
  label,
  showUnit = true,
  highlighted = false,
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [hasChanged, setHasChanged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const level = getConfidenceLevel(confidence);
  const colorClass = getConfidenceColor(level, highlighted);
  const bgClass = getConfidenceBg(level, highlighted);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback((): void => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onSave(numValue);
    }
    setIsEditing(false);
    setHasChanged(false);
  }, [editValue, min, max, onSave]);

  const handleCancel = useCallback((): void => {
    setEditValue(value.toString());
    setIsEditing(false);
    setHasChanged(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    } else if (!isEditing) {
      const step = decimals === 0 ? 10 : 1;
      if (e.key === "ArrowUp") {
        onSave(Math.min(value + step, max));
      } else if (e.key === "ArrowDown") {
        onSave(Math.max(value - step, min));
      }
    }
  }, [decimals, handleSave, handleCancel, isEditing, max, min, onSave, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditValue(e.target.value);
    setHasChanged(true);
  }, []);

  const handleBlur = useCallback((): void => {
    if (hasChanged) {
      handleSave();
    } else {
      setIsEditing(false);
    }
  }, [hasChanged, handleSave]);

  const startEditing = useCallback(() => {
    if (!isEditing) setIsEditing(true);
  }, [isEditing]);

  const displayValue = decimals === 0 ? Math.round(value) : value.toFixed(decimals);

  return (
    <div
      className={`relative inline-block w-full ${bgClass} rounded-lg transition-colors`}
      onClick={startEditing}
    >
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-text-dark-secondary mb-1.5">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-between p-2.5 rounded-lg border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-background-dark-secondary cursor-pointer transition-all ${colorClass}`}
          >
            <span className="font-medium text-lg">{displayValue}</span>
            {showUnit && (
              <span className="text-sm text-gray-400 dark:text-text-dark-tertiary ml-1">
                {unit}
              </span>
            )}
            {(level === "low" || highlighted) && (
              <span className="ml-2 text-xs text-amber-500 dark:text-amber-400">✎</span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative"
          >
            <input
              ref={inputRef}
              type="text"
              inputMode={inputMode}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`w-full p-2.5 rounded-lg border-2 border-primary text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${colorClass} ${bgClass}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-text-dark-tertiary pointer-events-none">
              {unit}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

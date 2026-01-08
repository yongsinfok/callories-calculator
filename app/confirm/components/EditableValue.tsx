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

  // Get color based on confidence level
  const getColor = () => {
    if (level === "low") return "text-amber-600";
    if (level === "medium") return "text-amber-500";
    return "text-gray-700";
  };

  // Get background tint for low confidence
  const getBgColor = () => {
    if (level === "low" || highlighted) return "bg-amber-50";
    return "";
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle save
  const handleSave = useCallback(() => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onSave(numValue);
    }
    setIsEditing(false);
    setHasChanged(false);
  }, [editValue, min, max, onSave]);

  // Handle cancel
  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
    setHasChanged(false);
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "ArrowUp" && !isEditing) {
      // Desktop: increment by arrow keys
      const newValue = Math.min(value + (decimals === 0 ? 10 : 1), max);
      onSave(newValue);
    } else if (e.key === "ArrowDown" && !isEditing) {
      const newValue = Math.max(value - (decimals === 0 ? 10 : 1), min);
      onSave(newValue);
    }
  };

  // Handle value change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    setHasChanged(true);
  };

  // Handle blur (save on click away)
  const handleBlur = () => {
    if (hasChanged) {
      handleSave();
    } else {
      setIsEditing(false);
    }
  };

  const displayValue = decimals === 0 ? Math.round(value) : value.toFixed(decimals);

  return (
    <div
      className={`relative inline-block w-full ${getBgColor()} rounded-lg transition-colors`}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
            className={`flex items-center justify-between p-2.5 rounded-lg border-2 border-transparent hover:border-gray-200 hover:bg-white cursor-pointer transition-all ${getColor()}`}
          >
            <span className="font-medium text-lg">
              {displayValue}
            </span>
            {showUnit && (
              <span className="text-sm text-gray-400 ml-1">{unit}</span>
            )}
            {(level === "low" || highlighted) && (
              <span className="ml-2 text-xs text-amber-500">✎</span>
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
              className={`w-full p-2.5 rounded-lg border-2 border-primary text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${getColor()} ${getBgColor()}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              {unit}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

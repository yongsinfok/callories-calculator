"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trash2, Undo2 } from "lucide-react";
import type { FoodEntry } from "../types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EditableValue } from "./EditableValue";
import { PortionSlider } from "./PortionSlider";

interface FoodCardProps {
  food: FoodEntry;
  index: number;
  onUpdate: (index: number, field: keyof FoodEntry, value: unknown) => void;
  onDelete: (index: number) => void;
  onUndo?: (index: number) => void;
  showDelete?: boolean;
}

const CONFIDENCE_THRESHOLD = 50;
const HIGHLIGHT_THRESHOLD = 70;
const DELETE_DELAY = 300;

type NutritionField = "calories" | "protein_g" | "carbs_g" | "fat_g";

export function FoodCard({
  food,
  index,
  onUpdate,
  onDelete,
  onUndo,
  showDelete = true,
}: FoodCardProps) {
  const [cascadingEdits] = useState(true);
  const [originalWeight] = useState(food.estimated_weight_g.value);
  const [lastDeleted, setLastDeleted] = useState(false);

  // Update a confidence value field
  const updateConfidenceValue = useCallback(
    (field: NutritionField | "estimated_weight_g", newValue: number): void => {
      const currentField = food[field];
      if (typeof currentField === "object" && "value" in currentField) {
        onUpdate(index, field, { ...currentField, value: newValue });
      }
    },
    [food, index, onUpdate]
  );

  // Handle weight change with cascading recalculation
  const handleWeightChange = useCallback(
    (newWeight: number): void => {
      const oldWeight = food.estimated_weight_g.value;
      const ratio = newWeight / oldWeight;

      // Update weight
      updateConfidenceValue("estimated_weight_g", newWeight);

      // Cascade to other values if enabled
      if (cascadingEdits) {
        const nutritionFields: NutritionField[] = ["calories", "protein_g", "carbs_g", "fat_g"];
        nutritionFields.forEach((field) => {
          const currentValue = food[field].value;
          const scaledValue =
            field === "calories"
              ? Math.round(currentValue * ratio)
              : parseFloat((currentValue * ratio).toFixed(1));
          updateConfidenceValue(field, scaledValue);
        });
      }
    },
    [food, cascadingEdits, updateConfidenceValue]
  );

  // Handle individual value change
  const handleValueChange = useCallback(
    (field: keyof FoodEntry) => (newValue: number): void => {
      const currentField = food[field as keyof typeof food];
      if (typeof currentField === "object" && "value" in currentField) {
        onUpdate(index, field, { ...currentField, value: newValue });
      }
    },
    [food, index, onUpdate]
  );

  // Handle name change
  const handleNameChange = useCallback(
    (newName: string): void => {
      onUpdate(index, "food_name", newName);
    },
    [index, onUpdate]
  );

  // Handle delete with undo
  const handleDelete = useCallback((): void => {
    setLastDeleted(true);
    setTimeout(() => {
      onDelete(index);
    }, DELETE_DELAY);
  }, [index, onDelete]);

  // Handle undo
  const handleUndo = useCallback((): void => {
    setLastDeleted(false);
    onUndo?.(index);
  }, [index, onUndo]);

  if (lastDeleted) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-100 dark:bg-background-dark-secondary rounded-2xl p-5 border-2 border-dashed border-gray-300 dark:border-gray-700"
      >
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-text-dark-tertiary">
          <Undo2 className="w-4 h-4" />
          <button
            onClick={handleUndo}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            撤销删除
          </button>
        </div>
      </motion.div>
    );
  }

  const isLowConfidence = food.confidence < CONFIDENCE_THRESHOLD;
  const borderClass = isLowConfidence
    ? "border-red-200 dark:border-red-800"
    : "border-gray-100 dark:border-gray-800";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white dark:bg-background-dark-secondary rounded-2xl p-5 shadow-sm border-2 transition-all ${borderClass}`}
    >
      {/* Card header with name and confidence */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={food.food_name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-lg font-display font-semibold text-gray-800 dark:text-text-dark-primary bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 w-full"
          />
        </div>
        <ConfidenceBadge confidence={food.confidence} size="sm" />
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
        >
          <p className="text-sm text-red-700 dark:text-red-400">
            ⚠️ AI 对此食物的识别不确定，请仔细检查或重新拍照
          </p>
        </motion.div>
      )}

      {/* Portion slider */}
      <div className="mb-4">
        <PortionSlider
          value={food.estimated_weight_g.value}
          originalValue={originalWeight}
          onChange={handleWeightChange}
          onPercentageChange={() => {}}
        />
      </div>

      {/* Nutrition values grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Calories */}
        <EditableValue
          label="热量"
          value={food.calories.value}
          confidence={food.calories.confidence}
          unit="kcal"
          onSave={handleValueChange("calories")}
          decimals={0}
          highlighted={food.calories.confidence < HIGHLIGHT_THRESHOLD}
        />

        {/* Weight */}
        <EditableValue
          label="重量"
          value={food.estimated_weight_g.value}
          confidence={food.estimated_weight_g.confidence}
          unit="g"
          onSave={(newValue) => {
            onUpdate(index, "estimated_weight_g", {
              ...food.estimated_weight_g,
              value: newValue,
            });
          }}
          decimals={0}
          highlighted={food.estimated_weight_g.confidence < HIGHLIGHT_THRESHOLD}
        />
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2">
        <EditableValue
          label="蛋白质"
          value={food.protein_g.value}
          confidence={food.protein_g.confidence}
          unit="g"
          onSave={handleValueChange("protein_g")}
          decimals={1}
          highlighted={food.protein_g.confidence < HIGHLIGHT_THRESHOLD}
        />

        <EditableValue
          label="碳水"
          value={food.carbs_g.value}
          confidence={food.carbs_g.confidence}
          unit="g"
          onSave={handleValueChange("carbs_g")}
          decimals={1}
          highlighted={food.carbs_g.confidence < HIGHLIGHT_THRESHOLD}
        />

        <EditableValue
          label="脂肪"
          value={food.fat_g.value}
          confidence={food.fat_g.confidence}
          unit="g"
          onSave={handleValueChange("fat_g")}
          decimals={1}
          highlighted={food.fat_g.confidence < HIGHLIGHT_THRESHOLD}
        />
      </div>

      {/* Delete button */}
      {showDelete && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-text-dark-tertiary hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            删除此项
          </button>
        </div>
      )}
    </motion.div>
  );
}

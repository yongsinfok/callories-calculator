"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trash2, Undo2 } from "lucide-react";
import { FoodEntry } from "../types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EditableValue } from "./EditableValue";
import { PortionSlider } from "./PortionSlider";

interface FoodCardProps {
  food: FoodEntry;
  index: number;
  onUpdate: (index: number, field: keyof FoodEntry, value: any) => void;
  onDelete: (index: number) => void;
  onUndo?: (index: number) => void;
  showDelete?: boolean;
}

export function FoodCard({
  food,
  index,
  onUpdate,
  onDelete,
  onUndo,
  showDelete = true,
}: FoodCardProps) {
  const [showSlider, setShowSlider] = useState(false);
  const [cascadingEdits, setCascadingEdits] = useState(true);
  const [originalWeight] = useState(food.estimated_weight_g.value);
  const [lastDeleted, setLastDeleted] = useState(false);

  // Handle weight change with cascading recalculation
  const handleWeightChange = useCallback((newWeight: number) => {
    const oldWeight = food.estimated_weight_g.value;
    const ratio = newWeight / oldWeight;

    // Update weight
    onUpdate(index, "estimated_weight_g", {
      ...food.estimated_weight_g,
      value: newWeight,
    });

    // Cascade to other values if enabled
    if (cascadingEdits) {
      onUpdate(index, "calories", {
        ...food.calories,
        value: Math.round(food.calories.value * ratio),
      });
      onUpdate(index, "protein_g", {
        ...food.protein_g,
        value: parseFloat((food.protein_g.value * ratio).toFixed(1)),
      });
      onUpdate(index, "carbs_g", {
        ...food.carbs_g,
        value: parseFloat((food.carbs_g.value * ratio).toFixed(1)),
      });
      onUpdate(index, "fat_g", {
        ...food.fat_g,
        value: parseFloat((food.fat_g.value * ratio).toFixed(1)),
      });
    }
  }, [food, index, onUpdate, cascadingEdits]);

  // Handle individual value change
  const handleValueChange = useCallback((field: keyof FoodEntry) => (newValue: number) => {
    const currentField = food[field as keyof typeof food];
    if (typeof currentField === "object" && "value" in currentField) {
      onUpdate(index, field, {
        ...currentField,
        value: newValue,
      });
    }
  }, [food, index, onUpdate]);

  // Handle name change
  const handleNameChange = useCallback((newName: string) => {
    onUpdate(index, "food_name", newName);
  }, [index, onUpdate]);

  // Handle delete with undo
  const handleDelete = useCallback(() => {
    setLastDeleted(true);
    setTimeout(() => {
      onDelete(index);
    }, 300);
  }, [index, onDelete]);

  // Handle undo
  const handleUndo = useCallback(() => {
    setLastDeleted(false);
    if (onUndo) {
      onUndo(index);
    }
  }, [index, onUndo]);

  if (lastDeleted) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-100 rounded-2xl p-5 border-2 border-dashed border-gray-300"
      >
        <div className="flex items-center justify-center gap-2 text-gray-500">
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
        food.confidence < 50 ? "border-red-200" : "border-gray-100"
      }`}
    >
      {/* Card header with name and confidence */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={food.food_name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-lg font-display font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 w-full"
          />
        </div>
        <ConfidenceBadge confidence={food.confidence} size="sm" />
      </div>

      {/* Low confidence warning */}
      {food.confidence < 50 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100"
        >
          <p className="text-sm text-red-700">
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
          highlighted={food.calories.confidence < 70}
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
          highlighted={food.estimated_weight_g.confidence < 70}
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
          highlighted={food.protein_g.confidence < 70}
        />

        <EditableValue
          label="碳水"
          value={food.carbs_g.value}
          confidence={food.carbs_g.confidence}
          unit="g"
          onSave={handleValueChange("carbs_g")}
          decimals={1}
          highlighted={food.carbs_g.confidence < 70}
        />

        <EditableValue
          label="脂肪"
          value={food.fat_g.value}
          confidence={food.fat_g.confidence}
          unit="g"
          onSave={handleValueChange("fat_g")}
          decimals={1}
          highlighted={food.fat_g.confidence < 70}
        />
      </div>

      {/* Delete button */}
      {showDelete && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            删除此项
          </button>
        </div>
      )}
    </motion.div>
  );
}

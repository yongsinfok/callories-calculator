"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Sparkles, Camera } from "lucide-react";
import {
  FoodEntry,
  RecognitionResult,
  ConfidenceValue,
} from "./types";
import { FoodCard, ConfidenceBadge } from "./components";

// Legacy interface for backward compatibility
interface LegacyFoodItem {
  food_name: string;
  estimated_weight_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface LegacyRecognitionResult {
  foods: LegacyFoodItem[];
  total_calories: number;
  confidence: "high" | "medium" | "low";
}

// Normalize legacy or new API response to FoodEntry format
function normalizeFoodEntry(
  food: any,
  index: number
): FoodEntry {
  // Check if already in new format
  if (
    food.estimated_weight_g &&
    typeof food.estimated_weight_g === "object" &&
    "value" in food.estimated_weight_g
  ) {
    return {
      id: `food-${index}-${Date.now()}`,
      food_name: food.food_name,
      confidence: food.confidence ?? 75,
      estimated_weight_g: food.estimated_weight_g,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
    };
  }

  // Legacy format - convert to new format
  const legacyConfidence = food.confidence ?? 75;
  const getConfidenceScore = (baseConfidence?: number): number => {
    const conf = baseConfidence ?? legacyConfidence;
    if (typeof conf === "string") {
      // Convert "high"/"medium"/"low" to number
      if (conf === "high") return 90;
      if (conf === "medium") return 65;
      return 40;
    }
    return conf;
  };

  return {
    id: `food-${index}-${Date.now()}`,
    food_name: food.food_name,
    confidence: legacyConfidence,
    estimated_weight_g: {
      value: food.estimated_weight_g,
      confidence: getConfidenceScore(food.estimated_weight_g_confidence),
    },
    calories: {
      value: food.calories,
      confidence: getConfidenceScore(food.calories_confidence),
    },
    protein_g: {
      value: food.protein_g,
      confidence: getConfidenceScore(food.protein_g_confidence),
    },
    carbs_g: {
      value: food.carbs_g,
      confidence: getConfidenceScore(food.carbs_g_confidence),
    },
    fat_g: {
      value: food.fat_g,
      confidence: getConfidenceScore(food.fat_g_confidence),
    },
  };
}

function ConfirmContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [editableFoods, setEditableFoods] = useState<FoodEntry[]>([]);
  const [deletedFoods, setDeletedFoods] = useState<Map<number, FoodEntry>>(new Map());
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch");
  const [undoToast, setUndoToast] = useState<{ show: boolean; foodName: string }>({
    show: false,
    foodName: "",
  });
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const imageData = sessionStorage.getItem("foodImage");
    if (imageData) {
      setImage(imageData);
      recognizeFood(imageData);
    } else {
      router.push("/camera");
    }
  }, []);

  const recognizeFood = async (imageData: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recognize-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "识别失败");
      }

      // Normalize foods to new format
      const normalizedFoods = data.foods.map(
        (food: any, index: number) => normalizeFoodEntry(food, index)
      );

      setResult({
        foods: normalizedFoods,
        total_calories: data.total_calories,
      });
      setEditableFoods(normalizedFoods);

      // Clear sessionStorage after successful recognition
      sessionStorage.removeItem("foodImage");
    } catch (err: any) {
      setError(err.message || "识别失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // Update a specific field in a food entry
  const handleFoodUpdate = useCallback(
    (index: number, field: keyof FoodEntry, value: any) => {
      setEditableFoods((prev) => {
        const newFoods = [...prev];
        const food = { ...newFoods[index] };
        (food as any)[field] = value;
        newFoods[index] = food;
        return newFoods;
      });
    },
    []
  );

  // Handle delete food
  const handleDeleteFood = useCallback((index: number) => {
    setEditableFoods((prev) => {
      const food = prev[index];
      const newDeleted = new Map(deletedFoods);
      newDeleted.set(index, food);
      setDeletedFoods(newDeleted);

      // Show undo toast
      setUndoToast({ show: true, foodName: food.food_name });
      setTimeout(() => setUndoToast({ show: false, foodName: "" }), 3000);

      return prev.filter((_, i) => i !== index);
    });
  }, [deletedFoods]);

  // Handle undo delete
  const handleUndoDelete = useCallback(() => {
    if (deletedFoods.size > 0) {
      const lastEntry = Array.from(deletedFoods).pop();
      if (lastEntry) {
        const [index, food] = lastEntry;
        setEditableFoods((prev) => [...prev, food]);
        setDeletedFoods((prev) => {
          const newMap = new Map(prev);
          newMap.delete(index);
          return newMap;
        });
        setUndoToast({ show: false, foodName: "" });
      }
    }
  }, [deletedFoods]);

  const handleSave = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const today = new Date().toISOString().split("T")[0];

      // Save each food item
      for (const food of editableFoods) {
        await supabase.from("food_entries").insert({
          user_id: user.id,
          food_name: food.food_name,
          calories: food.calories.value,
          protein_g: food.protein_g.value,
          carbs_g: food.carbs_g.value,
          fat_g: food.fat_g.value,
          meal_type: selectedMealType,
          estimated_weight_g: food.estimated_weight_g.value,
          entry_date: today,
        });

        // Add to user's food library
        await supabase
          .from("user_food_library")
          .upsert(
            {
              user_id: user.id,
              food_name: food.food_name,
              calories_per_100g: Math.round(
                (food.calories.value / food.estimated_weight_g.value) * 100
              ),
              protein_g_per_100g: parseFloat(
                ((food.protein_g.value / food.estimated_weight_g.value) * 100).toFixed(2)
              ),
              carbs_g_per_100g: parseFloat(
                ((food.carbs_g.value / food.estimated_weight_g.value) * 100).toFixed(2)
              ),
              fat_g_per_100g: parseFloat(
                ((food.fat_g.value / food.estimated_weight_g.value) * 100).toFixed(2)
              ),
            },
            {
              onConflict: "user_id,food_name",
            }
          );
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-cream dark:bg-background-dark flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mb-4"
        />
        <p className="text-text-primary dark:text-text-dark-primary font-medium">AI 正在识别食物...</p>
        <p className="text-text-secondary dark:text-text-dark-secondary text-sm mt-2">通常需要 3-5 秒</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-cream dark:bg-background-dark flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-xl font-display font-bold text-text-primary dark:text-text-dark-primary mb-2">
          识别失败
        </h2>
        <p className="text-text-secondary dark:text-text-dark-secondary text-center mb-6">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="btn-secondary">
            返回
          </button>
          <button onClick={() => router.push("/camera")} className="btn-primary">
            重新拍照
          </button>
        </div>
      </div>
    );
  }

  if (!result || editableFoods.length === 0) {
    return (
      <div className="min-h-screen bg-background-cream dark:bg-background-dark flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-background-dark-secondary flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-gray-400 dark:text-text-dark-tertiary" />
        </div>
        <h2 className="text-xl font-display font-bold text-text-primary dark:text-text-dark-primary mb-2">
          没有检测到食物
        </h2>
        <p className="text-text-secondary dark:text-text-dark-secondary text-center mb-6">
          AI 未能识别出图片中的食物
        </p>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="btn-secondary">
            返回
          </button>
          <button onClick={() => router.push("/camera")} className="btn-primary">
            重新拍照
          </button>
        </div>
      </div>
    );
  }

  // Calculate total calories from editable foods
  const totalCalories = editableFoods.reduce(
    (sum, food) => sum + food.calories.value,
    0
  );

  return (
    <div className="min-h-screen bg-background-cream dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-background-dark-secondary border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-background-dark flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary dark:text-text-dark-primary" />
          </button>
          <h1 className="text-lg font-display font-semibold text-text-primary dark:text-text-dark-primary">
            确认食物
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Image preview */}
        <div className="mb-6">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <img src={image} alt="Food" className="w-full h-48 object-cover" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium text-gray-700 dark:text-text-dark-secondary">
                AI 检测到 {editableFoods.length} 种食物
              </span>
            </div>
          </div>
        </div>

        {/* Meal type selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-3">
            餐型
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMealType(meal)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  selectedMealType === meal
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-background-dark-secondary text-text-secondary dark:text-text-dark-secondary hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {meal === "breakfast" && "早餐"}
                {meal === "lunch" && "午餐"}
                {meal === "dinner" && "晚餐"}
                {meal === "snack" && "加餐"}
              </button>
            ))}
          </div>
        </div>

        {/* Food items */}
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-text-primary dark:text-text-dark-primary">
            食物详情
          </h2>

          <AnimatePresence mode="popLayout">
            {editableFoods.map((food, index) => (
              <FoodCard
                key={food.id}
                food={food}
                index={index}
                onUpdate={handleFoodUpdate}
                onDelete={handleDeleteFood}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Total calories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 text-white"
        >
          <p className="text-white/80 text-sm mb-1">总计热量</p>
          <p className="text-4xl font-display font-bold">
            {totalCalories}
            <span className="text-lg font-normal"> 大卡</span>
          </p>
        </motion.div>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark-secondary border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSaving ? (
              "保存中..."
            ) : (
              <>
                <Check className="w-5 h-5" />
                确认保存
              </>
            )}
          </button>
        </div>
      </div>

      {/* Undo toast */}
      <AnimatePresence>
        {undoToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between"
          >
            <span className="text-sm">已删除 "{undoToast.foodName}"</span>
            <button
              onClick={handleUndoDelete}
              className="text-primary font-medium text-sm hover:underline"
            >
              撤销
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-cream dark:bg-background-dark flex items-center justify-center">
          加载中...
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}

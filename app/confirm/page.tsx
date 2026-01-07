"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Sparkles, AlertCircle } from "lucide-react";

interface FoodItem {
  food_name: string;
  estimated_weight_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface RecognitionResult {
  foods: FoodItem[];
  total_calories: number;
  confidence: "high" | "medium" | "low";
}

function ConfirmContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch");
  const [editableFoods, setEditableFoods] = useState<FoodItem[]>([]);
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

      setResult(data);
      setEditableFoods(data.foods);
      // Clear sessionStorage after successful recognition
      sessionStorage.removeItem("foodImage");
    } catch (err: any) {
      setError(err.message || "识别失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodChange = (index: number, field: keyof FoodItem, value: string | number) => {
    const newFoods = [...editableFoods];
    (newFoods[index][field] as any) = value;
    setEditableFoods(newFoods);
  };

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
          calories: food.calories,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          meal_type: selectedMealType,
          estimated_weight_g: food.estimated_weight_g,
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
                (food.calories / food.estimated_weight_g) * 100
              ),
              protein_g_per_100g: parseFloat(
                ((food.protein_g / food.estimated_weight_g) * 100).toFixed(2)
              ),
              carbs_g_per_100g: parseFloat(
                ((food.carbs_g / food.estimated_weight_g) * 100).toFixed(2)
              ),
              fat_g_per_100g: parseFloat(
                ((food.fat_g / food.estimated_weight_g) * 100).toFixed(2)
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-success";
      case "medium":
        return "text-warning";
      case "low":
        return "text-error";
      default:
        return "text-text-secondary";
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "高置信度";
      case "medium":
        return "中等置信度";
      case "low":
        return "低置信度";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-cream flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mb-4"
        />
        <p className="text-text-primary font-medium">AI 正在识别食物...</p>
        <p className="text-text-secondary text-sm mt-2">通常需要 3-5 秒</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-cream flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-xl font-display font-bold text-text-primary mb-2">
          识别失败
        </h2>
        <p className="text-text-secondary text-center mb-6">{error}</p>
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-lg font-display font-semibold text-text-primary">
            确认食物
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Image preview */}
        <div className="mb-6">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img src={image} alt="Food" className="w-full h-48 object-cover" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                {getConfidenceLabel(result.confidence)}
              </span>
            </div>
            <span className="text-text-secondary text-sm">
              共 {editableFoods.length} 种食物
            </span>
          </div>
        </div>

        {/* Meal type selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-3">
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
                    : "bg-white text-text-secondary hover:bg-gray-50"
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
          <h2 className="text-lg font-display font-semibold text-text-primary">
            食物详情
          </h2>

          <AnimatePresence mode="popLayout">
            {editableFoods.map((food, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
              >
                {/* Food name */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    食物名称
                  </label>
                  <input
                    type="text"
                    value={food.food_name}
                    onChange={(e) => handleFoodChange(index, "food_name", e.target.value)}
                    className="input"
                  />
                </div>

                {/* Weight and calories */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      估算重量 (克)
                    </label>
                    <input
                      type="number"
                      value={food.estimated_weight_g}
                      onChange={(e) =>
                        handleFoodChange(index, "estimated_weight_g", parseFloat(e.target.value) || 0)
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      热量 (大卡)
                    </label>
                    <input
                      type="number"
                      value={food.calories}
                      onChange={(e) =>
                        handleFoodChange(index, "calories", parseInt(e.target.value) || 0)
                      }
                      className="input"
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      蛋白质
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={food.protein_g}
                        onChange={(e) =>
                          handleFoodChange(index, "protein_g", parseFloat(e.target.value) || 0)
                        }
                        className="input pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
                        g
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      碳水
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={food.carbs_g}
                        onChange={(e) =>
                          handleFoodChange(index, "carbs_g", parseFloat(e.target.value) || 0)
                        }
                        className="input pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
                        g
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      脂肪
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={food.fat_g}
                        onChange={(e) =>
                          handleFoodChange(index, "fat_g", parseFloat(e.target.value) || 0)
                        }
                        className="input pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
                        g
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
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
            {editableFoods.reduce((sum, food) => sum + food.calories, 0)}
            <span className="text-lg font-normal"> 大卡</span>
          </p>
        </motion.div>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
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
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-cream flex items-center justify-center">加载中...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}

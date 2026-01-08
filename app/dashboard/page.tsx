"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  User,
  Flame,
  Calendar,
  Trash2,
  ChevronRight,
  Wheat,
  Beef,
  Droplet,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  created_at: string;
}

interface Profile {
  daily_calorie_target: number;
}

interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (user) {
      loadData();
    }
  }, [user, loading]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("daily_calorie_target")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load today's entries
      const today = new Date().toISOString().split("T")[0];
      const { data: entriesData } = await supabase
        .from("food_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .order("created_at", { ascending: false });

      if (entriesData) {
        setEntries(entriesData);
        const total = entriesData.reduce(
          (sum, entry) => sum + entry.calories,
          0
        );
        const protein = entriesData.reduce(
          (sum, entry) => sum + (entry.protein_g || 0),
          0
        );
        const carbs = entriesData.reduce(
          (sum, entry) => sum + (entry.carbs_g || 0),
          0
        );
        const fat = entriesData.reduce(
          (sum, entry) => sum + (entry.fat_g || 0),
          0
        );
        setTotalCalories(total);
        setTotalProtein(Math.round(protein));
        setTotalCarbs(Math.round(carbs));
        setTotalFat(Math.round(fat));
      }
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from("food_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      setEntries(entries.filter((e) => e.id !== id));
      const deletedEntry = entries.find((e) => e.id === id);
      if (deletedEntry) {
        setTotalCalories(totalCalories - deletedEntry.calories);
        setTotalProtein(Math.max(0, totalProtein - (deletedEntry.protein_g || 0)));
        setTotalCarbs(Math.max(0, totalCarbs - (deletedEntry.carbs_g || 0)));
        setTotalFat(Math.max(0, totalFat - (deletedEntry.fat_g || 0)));
      }
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: "早餐",
      lunch: "午餐",
      dinner: "晚餐",
      snack: "加餐",
    };
    return labels[type] || "其他";
  };

  const remainingCalories = profile
    ? profile.daily_calorie_target - totalCalories
    : 0;
  const progress = profile
    ? (totalCalories / profile.daily_calorie_target) * 100
    : 0;

  // Calculate macro goals based on calorie target (balanced diet: 30% protein, 40% carbs, 30% fat)
  const getMacroGoals = (calorieTarget: number): MacroGoals => {
    // Protein: 30% of calories, 4 calories per gram
    // Carbs: 40% of calories, 4 calories per gram
    // Fat: 30% of calories, 9 calories per gram
    return {
      protein: Math.round((calorieTarget * 0.30) / 4),
      carbs: Math.round((calorieTarget * 0.40) / 4),
      fat: Math.round((calorieTarget * 0.30) / 9),
    };
  };

  const macroGoals = profile ? getMacroGoals(profile.daily_calorie_target) : null;

  // Calculate macro progress percentages
  const getMacroProgress = (current: number, goal: number) => {
    if (!goal) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getMacroColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 80) return "bg-primary";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background-cream dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-primary dark:text-text-dark-primary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-background-dark-secondary border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-text-primary dark:text-text-dark-primary">
            今日热量
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-background-dark flex items-center justify-center"
            >
              <User className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-background-dark-secondary rounded-3xl p-8 mb-6 shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-48 h-48 progress-ring">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#F3F4F6"
                  strokeWidth="12"
                  fill="none"
                  className="dark:stroke-gray-800"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 88 * (1 - Math.min(progress / 100, 1))
                  }`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 88 * (1 - Math.min(progress / 100, 1)),
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#FF8E53" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-8 h-8 text-primary mb-2" />
                <p className="text-4xl font-display font-bold text-text-primary dark:text-text-dark-primary">
                  {totalCalories}
                </p>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">/ {profile?.daily_calorie_target}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm mb-1">还可摄入</p>
            <p className="text-3xl font-display font-bold text-text-primary dark:text-text-dark-primary">
              {remainingCalories > 0 ? remainingCalories : 0}
            </p>
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm">大卡</p>
          </div>
        </motion.div>

        {/* Macros Tracking */}
        {macroGoals && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-background-dark-secondary rounded-3xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-4">营养目标</h3>
            <div className="space-y-4">
              {/* Protein */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Beef className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">蛋白质</span>
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      {totalProtein}g / {macroGoals.protein}g
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getMacroProgress(totalProtein, macroGoals.protein)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${getMacroColor(getMacroProgress(totalProtein, macroGoals.protein))}`}
                    />
                  </div>
                </div>
              </div>

              {/* Carbs */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Wheat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">碳水</span>
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      {totalCarbs}g / {macroGoals.carbs}g
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getMacroProgress(totalCarbs, macroGoals.carbs)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${getMacroColor(getMacroProgress(totalCarbs, macroGoals.carbs))}`}
                    />
                  </div>
                </div>
              </div>

              {/* Fat */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">脂肪</span>
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      {totalFat}g / {macroGoals.fat}g
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getMacroProgress(totalFat, macroGoals.fat)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${getMacroColor(getMacroProgress(totalFat, macroGoals.fat))}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Food Entries List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-text-primary dark:text-text-dark-primary">
              今日记录
            </h2>
            <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {entries.length} 餐
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-background-dark-secondary flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-text-tertiary dark:text-text-dark-tertiary" />
                </div>
                <p className="text-text-secondary dark:text-text-dark-secondary mb-2">今天还没有记录</p>
                <p className="text-text-tertiary dark:text-text-dark-tertiary text-sm">
                  点击下方按钮开始记录
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white dark:bg-background-dark-secondary rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {getMealTypeLabel(entry.meal_type || "snack")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">
                          {entry.food_name}
                        </h3>
                        <p className="text-text-primary dark:text-text-dark-primary font-display font-bold">
                          {entry.calories} 大卡
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="w-10 h-10 rounded-xl hover:bg-error/10 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-error" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20"
      >
        <Link
          href="/camera"
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <Camera className="w-5 h-5" />
          <span className="font-semibold">拍照记录</span>
          <Plus className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}

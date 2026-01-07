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
} from "lucide-react";
import Link from "next/link";

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  created_at: string;
}

interface Profile {
  daily_calorie_target: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
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
        setTotalCalories(total);
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

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="text-text-primary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-text-primary">
            今日热量
          </h1>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <User className="w-5 h-5 text-text-secondary" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 mb-6 shadow-sm border border-gray-100"
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
                <p className="text-4xl font-display font-bold text-text-primary">
                  {totalCalories}
                </p>
                <p className="text-sm text-text-secondary">/ {profile?.daily_calorie_target}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-text-secondary text-sm mb-1">还可摄入</p>
            <p className="text-3xl font-display font-bold text-text-primary">
              {remainingCalories > 0 ? remainingCalories : 0}
            </p>
            <p className="text-text-secondary text-sm">大卡</p>
          </div>
        </motion.div>

        {/* Food Entries List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              今日记录
            </h2>
            <span className="text-sm text-text-secondary">
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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-text-tertiary" />
                </div>
                <p className="text-text-secondary mb-2">今天还没有记录</p>
                <p className="text-text-tertiary text-sm">
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
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {getMealTypeLabel(entry.meal_type || "snack")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-text-primary mb-1">
                          {entry.food_name}
                        </h3>
                        <p className="text-text-primary font-display font-bold">
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

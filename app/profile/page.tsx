"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Target,
  Activity,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { getGoalTypeLabel, getActivityLevelLabel, type Gender, type ActivityLevel, type GoalType } from "@/lib/calculations";
import Link from "next/link";

interface Profile {
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  goal_type: GoalType;
  daily_calorie_target: number;
  bmr: number;
  tdee: number;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("加载个人资料失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="text-text-primary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-display font-semibold text-text-primary">
            我的资料
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* User info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-text-tertiary text-sm">邮箱</p>
              <p className="text-text-primary font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-text-primary">
                {profile?.age || 0}
              </p>
              <p className="text-xs text-text-secondary">年龄</p>
            </div>
            <div className="text-center border-l border-r border-gray-100">
              <p className="text-2xl font-display font-bold text-text-primary">
                {profile?.height_cm || 0}
              </p>
              <p className="text-xs text-text-secondary">身高</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-text-primary">
                {profile?.weight_kg || 0}
              </p>
              <p className="text-xs text-text-secondary">体重</p>
            </div>
          </div>
        </motion.div>

        {/* Calorie targets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            热量目标
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">基础代谢 (BMR)</span>
              <span className="text-text-primary font-semibold">
                {profile?.bmr || 0} 大卡
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">每日消耗 (TDEE)</span>
              <span className="text-text-primary font-semibold">
                {profile?.tdee || 0} 大卡
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl">
              <span className="text-primary font-medium">每日目标</span>
              <span className="text-xl font-display font-bold text-primary">
                {profile?.daily_calorie_target || 0} 大卡
              </span>
            </div>
          </div>
        </motion.div>

        {/* Goals and settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <Link
            href="/onboarding?edit=true"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-text-primary font-medium">更新目标</p>
                <p className="text-text-secondary text-sm">
                  {getGoalTypeLabel(profile?.goal_type || "maintain")} · {getActivityLevelLabel(profile?.activity_level || "moderate")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-tertiary" />
          </Link>

          <button
            disabled
            className="w-full flex items-center justify-between p-4 opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-text-primary font-medium">设置</p>
                <p className="text-text-secondary text-sm">即将推出</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-tertiary" />
          </button>
        </motion.div>

        {/* Logout button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={signOut}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-white hover:bg-error/5 text-error font-semibold py-4 px-6 rounded-xl transition-colors border border-gray-100"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </motion.button>

        <p className="text-center text-text-tertiary text-sm mt-4">
          热量追踪器 v1.0.0
        </p>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import {
  calculateTDEEComplete,
  getActivityLevelLabel,
  getGoalTypeLabel,
  type Gender,
  type ActivityLevel,
  type GoalType,
} from "@/lib/calculations";
import { motion } from "framer-motion";
import { ChevronRight, Scale, Activity, Target } from "lucide-react";

function OnboardingPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "male" as Gender,
    age: "",
    height: "",
    weight: "",
    activityLevel: "moderate" as ActivityLevel,
    goalType: "lose_weight" as GoalType,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    // Only check onboarding status if NOT in edit mode
    if (!isEditMode) {
      checkOnboardingStatus();
    } else {
      // Load existing data for editing
      loadExistingData();
    }
  }, [user, loading, isEditMode]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("height_cm")
      .eq("id", user.id)
      .single();

    if (data && data.height_cm > 0) {
      router.push("/dashboard");
    }
  };

  const loadExistingData = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFormData({
          gender: data.gender || "male",
          age: data.age?.toString() || "",
          height: data.height_cm?.toString() || "",
          weight: data.weight_kg?.toString() || "",
          activityLevel: data.activity_level || "moderate",
          goalType: data.goal_type || "lose_weight",
        });
      }
    } catch (err) {
      console.error("加载现有数据失败:", err);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSaving(true);

    const age = parseInt(formData.age);
    const height = parseInt(formData.height);
    const weight = parseFloat(formData.weight);

    const results = calculateTDEEComplete(
      weight,
      height,
      age,
      formData.gender,
      formData.activityLevel,
      formData.goalType
    );

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          gender: formData.gender,
          age: age,
          height_cm: height,
          weight_kg: weight,
          activity_level: formData.activityLevel,
          goal_type: formData.goalType,
          daily_calorie_target: results.dailyTarget,
          bmr: results.bmr,
          tdee: results.tdee,
        })
        .eq("id", user.id);

      if (error) throw error;
      router.push("/dashboard");
    } catch (err) {
      console.error("保存失败:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="text-text-primary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        {isEditMode && (
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm">返回</span>
            </button>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              更新目标
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              修改您的个人信息和健康目标
            </p>
          </div>
        )}
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="card"
        >
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                你的性别
              </h2>
              <div className="space-y-3">
                {(["male", "female", "other"] as Gender[]).map((gender) => (
                  <button
                    key={gender}
                    onClick={() =>
                      setFormData({ ...formData, gender })
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.gender === gender
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium text-text-primary">
                      {gender === "male" && "男"}
                      {gender === "female" && "女"}
                      {gender === "other" && "其他"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                身体数据
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      年龄
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className="input"
                      placeholder="25"
                      min="10"
                      max="100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      身高 (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                      className="input"
                      placeholder="170"
                      min="100"
                      max="250"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      体重 (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      className="input"
                      placeholder="70"
                      min="30"
                      max="300"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                活动水平
              </h2>
              <div className="space-y-3">
                {(
                  ["sedentary", "light", "moderate", "active", "very_active"] as ActivityLevel[]
                ).map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setFormData({ ...formData, activityLevel: level })
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.activityLevel === level
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium text-text-primary block">
                      {getActivityLevelLabel(level)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                你的目标
              </h2>
              <div className="space-y-3">
                {(
                  ["lose_weight", "maintain", "gain_muscle"] as GoalType[]
                ).map((goal) => (
                  <button
                    key={goal}
                    onClick={() =>
                      setFormData({ ...formData, goalType: goal })
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.goalType === goal
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="font-medium text-text-primary">
                        {getGoalTypeLabel(goal)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview */}
              {formData.age && formData.height && formData.weight && (
                <div className="mt-6 p-4 bg-background-cream rounded-xl">
                  <p className="text-sm text-text-secondary mb-2">
                    根据你的数据，你的每日目标约为：
                  </p>
                  <p className="text-3xl font-display font-bold text-primary">
                    {calculateTDEEComplete(
                      parseFloat(formData.weight),
                      parseInt(formData.height),
                      parseInt(formData.age),
                      formData.gender,
                      formData.activityLevel,
                      formData.goalType
                    ).dailyTarget}
                    <span className="text-lg text-text-secondary ml-1">
                      大卡
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={handleBack} className="btn-secondary flex-1">
                上一步
              </button>
            )}
            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={
                isSaving ||
                (step === 2 && (!formData.age || !formData.height || !formData.weight))
              }
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSaving
                ? "保存中..."
                : step === 4
                ? isEditMode
                  ? "保存更新"
                  : "开始使用"
                : "下一步"}
              {step < 4 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Wrap component in Suspense for useSearchParams
export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-cream flex items-center justify-center">加载中...</div>}>
      <OnboardingPageContent />
    </Suspense>
  );
}

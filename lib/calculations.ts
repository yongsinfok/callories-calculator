export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalType = "lose_weight" | "maintain" | "gain_muscle";

export interface TDEEResult {
  bmr: number;
  tdee: number;
  dailyTarget: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // 久坐 (办公室工作，极少运动)
  light: 1.375, // 轻度活动 (每周运动 1-3 天)
  moderate: 1.55, // 中度活动 (每周运动 3-5 天)
  active: 1.725, // 高度活动 (每周运动 6-7 天)
  very_active: 1.9, // 非常活跃 (体力劳动或每日高强度训练)
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * For men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
 * For women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "male") {
    bmr += 5;
  } else if (gender === "female") {
    bmr -= 161;
  }
  // For 'other', use the baseline without gender adjustment

  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateDailyTarget(tdee: number, goalType: GoalType): number {
  switch (goalType) {
    case "lose_weight":
      return Math.round(tdee - 500); // 500 calorie deficit
    case "gain_muscle":
      return Math.round(tdee + 300); // 300 calorie surplus
    case "maintain":
    default:
      return tdee;
  }
}

/**
 * Calculate complete TDEE results
 */
export function calculateTDEEComplete(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goalType: GoalType
): TDEEResult {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyTarget = calculateDailyTarget(tdee, goalType);

  return {
    bmr,
    tdee,
    dailyTarget,
  };
}

/**
 * Get display name for activity level
 */
export function getActivityLevelLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: "久坐 (办公室工作，极少运动)",
    light: "轻度活动 (每周运动 1-3 天)",
    moderate: "中度活动 (每周运动 3-5 天)",
    active: "高度活动 (每周运动 6-7 天)",
    very_active: "非常活跃 (体力劳动或每日高强度训练)",
  };
  return labels[level];
}

/**
 * Get display name for goal type
 */
export function getGoalTypeLabel(goal: GoalType): string {
  const labels: Record<GoalType, string> = {
    lose_weight: "减脂",
    maintain: "保持体重",
    gain_muscle: "增肌",
  };
  return labels[goal];
}

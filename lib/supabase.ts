import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          height_cm: number;
          weight_kg: number;
          age: number;
          gender: "male" | "female" | "other";
          activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
          goal_type: "lose_weight" | "maintain" | "gain_muscle";
          daily_calorie_target: number;
          bmr: number;
          tdee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          height_cm: number;
          weight_kg: number;
          age: number;
          gender: "male" | "female" | "other";
          activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
          goal_type: "lose_weight" | "maintain" | "gain_muscle";
          daily_calorie_target: number;
          bmr?: number;
          tdee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          height_cm?: number;
          weight_kg?: number;
          age?: number;
          gender?: "male" | "female" | "other";
          activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active";
          goal_type?: "lose_weight" | "maintain" | "gain_muscle";
          daily_calorie_target?: number;
          bmr?: number;
          tdee?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
          food_name: string;
          calories: number;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | null;
          image_url: string | null;
          estimated_weight_g: number | null;
          entry_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_name: string;
          calories: number;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | null;
          image_url?: string | null;
          estimated_weight_g?: number | null;
          entry_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_name?: string;
          calories?: number;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | null;
          image_url?: string | null;
          estimated_weight_g?: number | null;
          entry_date?: string;
          created_at?: string;
        };
      };
      user_food_library: {
        Row: {
          id: string;
          user_id: string;
          food_name: string;
          calories_per_100g: number;
          protein_g_per_100g: number | null;
          carbs_g_per_100g: number | null;
          fat_g_per_100g: number | null;
          use_count: number;
          last_used_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_name: string;
          calories_per_100g: number;
          protein_g_per_100g?: number | null;
          carbs_g_per_100g?: number | null;
          fat_g_per_100g?: number | null;
          use_count?: number;
          last_used_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_name?: string;
          calories_per_100g?: number;
          protein_g_per_100g?: number | null;
          carbs_g_per_100g?: number | null;
          fat_g_per_100g?: number | null;
          use_count?: number;
          last_used_at?: string;
          created_at?: string;
        };
      };
    };
  };
};

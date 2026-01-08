// Confidence value with score
export interface ConfidenceValue {
  value: number;
  confidence: number;
}

// Food entry from AI with confidence scores
export interface FoodEntry {
  id: string;
  food_name: string;
  confidence: number;
  estimated_weight_g: ConfidenceValue;
  calories: ConfidenceValue;
  protein_g: ConfidenceValue;
  carbs_g: ConfidenceValue;
  fat_g: ConfidenceValue;
}

// Editing state for a food entry
export interface EditingState {
  field: 'weight' | 'calories' | 'protein' | 'carbs' | 'fat' | null;
  sliderOpen: boolean;
  cascadingEdits: boolean;
}

// AI recognition response
export interface RecognitionResult {
  foods: FoodEntry[];
  total_calories: number;
}

// Confidence level for UI rendering
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Get confidence level from score
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

// Props for editable value component
export interface EditableValueProps {
  value: number;
  confidence: number;
  unit: string;
  onSave: (newValue: number) => void;
  inputMode?: 'decimal' | 'numeric';
  min?: number;
  max?: number;
}

// Props for portion slider component
export interface PortionSliderProps {
  value: number;
  originalValue: number;
  onChange: (newValue: number) => void;
  onPercentageChange: (percentage: number) => void;
}

// Props for confidence badge component
export interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

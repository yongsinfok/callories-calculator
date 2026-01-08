# Enhanced AI Result Editing - Design Document

**Date:** 2026-01-08
**Status:** Design Approved
**Author:** Claude + User

## Overview

Enhance the food confirmation screen to make editing AI-detected food data effortless. Users can tap any value to edit inline, adjust portions with a visual slider, and see confidence indicators that highlight uncertain values.

## Problem Statement

The current AI food recognition flow has friction when AI makes mistakes:
- Editing requires entering a separate edit mode
- No visual indication of which values AI is uncertain about
- Adjusting portion sizes requires typing numbers
- Users can't quickly verify what needs attention

## Solution

Inline editing + confidence highlighting + portion slider = seamless correction flow.

---

## UX Flow

**Before:** AI returns → user sees results → taps edit → enters edit mode → saves → returns

**After:** AI returns → user sees confidence indicators → taps any value → edits in place → auto-saves

### Confirm Screen Layout

```
┌─────────────────────────────────────┐
│  AI 检测到 2 种食物                    │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🍚 白米饭                        │  │
│  │ 信心: 高                        │  │
│  │                                │  │
│  │  [滑块: 150g ▰────────○─────]  │  │
│  │                                │  │
│  │  230 kcal  [50g] [5g] [1g]    │  │
│  │  ↓ 灰色   ↓ 灰色  ↓ 橙色         │  │
│  └───────────────────────────────┘  │
│  ⚠️ 低信心                           │  │
│  ┌───────────────────────────────┐  │
│  │ 🥗 蔬菜沙拉                      │  │
│  │ 信心: 低 - 请确认或编辑          │  │
│  └───────────────────────────────┘  │
│                                     │
│  [全部保存]  [重新拍照]               │
└─────────────────────────────────────┘
```

---

## Features

### 1. Confidence Highlighting

AI returns confidence scores (0-100) for each field. Map to visual indicators:

| Confidence | Visual | Behavior |
|------------|--------|----------|
| 80-100% | Normal color | Not editable by default |
| 50-79% | Amber tint | Highlighted, tap to edit |
| 0-49% | Red badge + border | Whole card emphasized |

**AI Response Format:**
```json
{
  "foods": [
    {
      "name": "白米饭",
      "confidence": 95,
      "weight": { "value": 150, "confidence": 90 },
      "calories": { "value": 230, "confidence": 85 },
      "fat": { "value": 1, "confidence": 30 }
    }
  ]
}
```

### 2. Inline Editing

Tap any value to edit in place - no modals, no navigation.

**Interactions:**
- Tap field → expands and shows keyboard
- Mobile: numeric keyboard (`inputMode="decimal"`)
- Desktop: arrow keys increment/decrement by 10
- Enter or tap outside → auto-save
- Escape → cancel

**Auto-recalculation:**
When weight is edited, all values scale proportionally:
- Example: 150g → 200g = all values × 1.33
- Edited values flash briefly to show change
- Toggle switch: "修改分量时自动重新计算" (default on)

### 3. Portion Slider

Visual slider for quick portion adjustment without typing.

**Behavior:**
- Range: 50% to 200% of AI estimate
- Snaps to 25% increments
- Real-time percentage indicator
- Values update live as you drag
- Only appears when weight field is tapped

**UI States:**
```
Collapsed:  150g ▼
           ↓ (tap)
Expanded:  150g ▼
           ────●──── (slider)
           当前: 150g (+0%)
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid input | Shake animation + toast |
| No confidence data | Default to medium, show all as editable |
| Extreme adjustment (>500%) | Confirmation dialog |
| Auto-recalc weirdness | Round to reasonable precision |
| Network error | Queue locally, sync when back |
| AI completely wrong | "删除此项" button on each card |

**Undo:** Shake-to-undo (mobile) or 3-second toast with "撤销" button.

**Empty State:** If all foods deleted, show [重新拍照] [手动添加] options.

---

## Component Structure

```
app/confirm/
├── page.tsx                    # Main confirm page
└── components/
    ├── FoodCard.tsx            # Individual food card
    ├── EditableValue.tsx       # Inline editable field
    ├── PortionSlider.tsx       # Weight adjustment slider
    ├── ConfidenceBadge.tsx     # Confidence indicator
    └── EditActions.tsx         # Delete/undo actions
```

### Data Types

```typescript
interface FoodEntry {
  id: string
  name: string
  confidence: number
  weight: { value: number; confidence: number }
  calories: { value: number; confidence: number }
  protein: { value: number; confidence: number }
  fat: { value: number; confidence: number }
  carbs: { value: number; confidence: number }
}

interface EditingState {
  field: 'weight' | 'calories' | null
  sliderOpen: boolean
  cascadingEdits: boolean
}
```

---

## Data Flow

1. Camera captures photo → send to `/api/recognize-food`
2. GLM-4.6V returns results with confidence scores
3. Parse and normalize to `FoodEntry[]`
4. Render `FoodCard` components with confidence styling
5. User taps value → set editing state, show input
6. User edits → update local state + recalc if enabled
7. User taps away → auto-save to Supabase
8. Optimistic update → redirect to dashboard

---

## API Changes

Update `/api/recognize-food` prompt to request confidence scores:

```
Prompt addition:
"For each food item and nutritional value, provide a confidence score (0-100).
Return in this format:
{
  "foods": [{
    "name": "...",
    "confidence": 85,
    "weight": {"value": 150, "confidence": 90},
    ...
  }]
}"
```

---

## Success Criteria

- Users can correct any AI-detected value in 2 taps or less
- Low-confidence values are visually obvious before editing
- Portion adjustments require no typing
- No data loss on network errors
- Average time from AI result to confirmed save: <10 seconds

---

## Out of Scope (Future Work)

- Split/merge foods (deferred to v2)
- Barcode scanning integration
- Voice input for corrections
- Multi-photo batch editing

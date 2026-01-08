"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface PortionSliderProps {
  value: number;
  originalValue: number;
  onChange: (newValue: number) => void;
  onPercentageChange: (percentage: number) => void;
  minPercentage?: number;
  maxPercentage?: number;
  step?: number;
}

export function PortionSlider({
  value,
  originalValue,
  onChange,
  onPercentageChange,
  minPercentage = 50,
  maxPercentage = 200,
  step = 25,
}: PortionSliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate current percentage
  const percentage = Math.round((value / originalValue) * 100);

  // Calculate color based on percentage
  const getColor = () => {
    if (percentage < 75) return "bg-blue-500";
    if (percentage > 125) return "bg-orange-500";
    return "bg-primary";
  };

  const getTextColor = () => {
    if (percentage < 75) return "text-blue-600 dark:text-blue-400";
    if (percentage > 125) return "text-orange-600 dark:text-orange-400";
    return "text-primary";
  };

  // Handle slider change
  const handleSliderChange = useCallback((clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;

    // Clamp to min/max
    const clampedPercent = Math.max(minPercentage, Math.min(maxPercentage, percent));

    // Snap to step increments
    const snappedPercent = Math.round(clampedPercent / step) * step;
    const finalPercent = Math.max(minPercentage, Math.min(maxPercentage, snappedPercent));

    const newValue = Math.round((originalValue * finalPercent) / 100);
    onChange(newValue);
    onPercentageChange(finalPercent);
  }, [originalValue, minPercentage, maxPercentage, step, onChange, onPercentageChange]);

  // Handle mouse/touch events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderChange(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleSliderChange(e.clientX);
    }
  }, [isDragging, handleSliderChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderChange(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      handleSliderChange(e.touches[0].clientX);
    }
  }, [isDragging, handleSliderChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  // Quick preset buttons
  const presets = [
    { label: "50%", value: 50 },
    { label: "75%", value: 75 },
    { label: "100%", value: 100 },
    { label: "125%", value: 125 },
    { label: "150%", value: 150 },
    { label: "200%", value: 200 },
  ];

  return (
    <div className="w-full">
      {/* Collapsed state */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all ${getTextColor()}`}
        >
          <span className="text-sm font-medium dark:text-text-dark-primary">分量调整</span>
          <div className="flex items-center gap-2">
            <span className="text-sm dark:text-text-dark-primary">
              {value}g
              {percentage !== 100 && (
                <span className="ml-1">
                  ({percentage > 100 ? "+" : ""}{percentage - 100}%)
                </span>
              )}
            </span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </motion.button>
      )}

      {/* Expanded state */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-white dark:bg-background-dark-secondary rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-text-dark-primary">分量调整</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 dark:text-text-dark-tertiary hover:text-gray-600 dark:hover:text-text-dark-secondary transition-colors"
              >
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Current value display */}
            <div className="text-center">
              <span className={`text-2xl font-bold ${getTextColor()}`}>
                {value}g
              </span>
              <span className="text-sm text-gray-500 dark:text-text-dark-secondary ml-2">
                {percentage > 100 ? "+" : ""}{percentage - 100}%
              </span>
            </div>

            {/* Slider track */}
            <div
              ref={trackRef}
              className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer select-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Fill */}
              <motion.div
                className={`absolute h-full ${getColor()} rounded-full`}
                style={{ width: `${((percentage - minPercentage) / (maxPercentage - minPercentage)) * 100}%` }}
                animate={{ width: `${((percentage - minPercentage) / (maxPercentage - minPercentage)) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Thumb */}
              <motion.div
                ref={sliderRef}
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 ${getColor()} rounded-full shadow-lg border-2 border-white dark:border-gray-900 cursor-grab active:cursor-grabbing`}
                style={{ left: `${((percentage - minPercentage) / (maxPercentage - minPercentage)) * 100}%` }}
                animate={{ left: `${((percentage - minPercentage) / (maxPercentage - minPercentage)) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Tick marks */}
              {presets.map((preset) => {
                const left = ((preset.value - minPercentage) / (maxPercentage - minPercentage)) * 100;
                return (
                  <div
                    key={preset.value}
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"
                    style={{ left: `${left}%` }}
                  />
                );
              })}
            </div>

            {/* Preset buttons */}
            <div className="flex justify-between gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    const newValue = Math.round((originalValue * preset.value) / 100);
                    onChange(newValue);
                    onPercentageChange(preset.value);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    percentage === preset.value
                      ? `${getTextColor()} ${getColor()} text-white`
                      : "bg-gray-100 dark:bg-background-dark text-gray-600 dark:text-text-dark-secondary hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

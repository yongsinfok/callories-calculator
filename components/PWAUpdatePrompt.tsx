"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, RefreshCw, Check } from "lucide-react";

const AUTO_UPDATE_KEY = "pwa-auto-update";
const SKIP_WAITING_MSG = { type: "SKIP_WAITING" };

interface PWAUpdatePromptProps {
  className?: string;
}

export function PWAUpdatePrompt({ className }: PWAUpdatePromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);

  // Load auto-update preference on mount
  useEffect(() => {
    setAutoUpdate(localStorage.getItem(AUTO_UPDATE_KEY) === "true");
  }, []);

  // Listen for service worker updates
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Handle controller change (new service worker activated)
    const handleControllerChange = (): void => {
      window.location.reload();
    };

    // Listen for the custom update event from service worker registration
    const handleUpdateAvailable = (): void => {
      if (localStorage.getItem(AUTO_UPDATE_KEY) !== "true") {
        setShowPrompt(true);
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    window.addEventListener("sw-update-available", handleUpdateAvailable);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      window.removeEventListener("sw-update-available", handleUpdateAvailable);
    };
  }, []);

  // Tell the waiting service worker to skip waiting and become active
  const sendSkipWaiting = useCallback((): void => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        registration.waiting.postMessage(SKIP_WAITING_MSG);
      }
    });
  }, []);

  const handleUpdate = useCallback(() => {
    setIsUpdating(true);
    sendSkipWaiting();
  }, [sendSkipWaiting]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const handleAutoUpdateToggle = useCallback(() => {
    const newValue = !autoUpdate;
    setAutoUpdate(newValue);
    localStorage.setItem(AUTO_UPDATE_KEY, String(newValue));

    // If enabling auto-update, apply it immediately if there's a waiting SW
    if (newValue) {
      sendSkipWaiting();
    }
  }, [autoUpdate, sendSkipWaiting]);

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Prompt Banner */}
          <motion.div
            initial={{ y: 100, rotateX: -15, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            exit={{
              y: 100,
              rotateX: 15,
              opacity: 0,
              transition: { duration: 0.3, ease: "easeIn" }
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              opacity: { duration: 0.2 }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-lg mx-auto bg-gradient-to-r from-primary to-primary-light rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-start gap-4">
                {/* Animated icon */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                >
                  <Download className="w-6 h-6" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">
                    发现新版本
                  </h3>
                  <p className="text-white/90 text-sm">
                    已准备好更新内容，点击按钮立即获取最新版本
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Auto-update toggle */}
              <button
                onClick={handleAutoUpdateToggle}
                className="flex items-center gap-2 mt-3 text-sm text-white/80 hover:text-white transition-colors"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  autoUpdate ? "bg-white border-white" : "border-white/50"
                }`}>
                  {autoUpdate && <Check className="w-3 h-3 text-primary" />}
                </div>
                <span>下次自动更新</span>
              </button>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm"
                >
                  稍后提醒
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-primary hover:bg-white/90 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isUpdating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.div>
                      更新中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      立即更新
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect } from "react";

const AUTO_UPDATE_KEY = "pwa-auto-update";
const SKIP_WAITING_MSG = { type: "SKIP_WAITING" };
const UPDATE_EVENT = "sw-update-available";
const UPDATE_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

function isAutoUpdateEnabled(): boolean {
  return localStorage.getItem(AUTO_UPDATE_KEY) === "true";
}

function skipWaiting(registration: ServiceWorkerRegistration): void {
  if (registration.waiting) {
    registration.waiting.postMessage(SKIP_WAITING_MSG);
  }
}

function notifyUpdateAvailable(): void {
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initSW = async (): Promise<(() => void) | undefined> => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) return;

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      const autoUpdate = isAutoUpdateEnabled();

      const handleUpdateAvailable = (): void => {
        if (registration.waiting) {
          if (autoUpdate) {
            skipWaiting(registration);
          } else {
            notifyUpdateAvailable();
          }
        }
      };

      // Check for existing waiting service worker
      handleUpdateAvailable();

      // Listen for new service worker installation
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && registration.waiting) {
            handleUpdateAvailable();
          }
        });
      });

      // Handle service worker messages
      const handleMessage = (event: MessageEvent): void => {
        if (event.data?.type === "SKIP_WAITING") {
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener("message", handleMessage);

      // Set up periodic update checks
      const checkForUpdates = async (): Promise<void> => {
        try {
          await registration.update();
        } catch {
          // Ignore update failures (might be offline)
        }
      };

      const handleFocus = (): void => {
        checkForUpdates();
      };
      window.addEventListener("focus", handleFocus);

      const updateInterval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
      setTimeout(checkForUpdates, 5000); // Initial check

      return () => {
        window.removeEventListener("focus", handleFocus);
        clearInterval(updateInterval);
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      };
    };

    const initTimer = setTimeout(() => {
      initSW().then((cleanup) => {
        if (cleanup) {
          (initTimer as unknown as { cleanup: () => void }).cleanup = cleanup;
        }
      });
    }, 1000);

    return () => {
      clearTimeout(initTimer);
      if (typeof (initTimer as unknown as { cleanup?: () => void }).cleanup === "function") {
        (initTimer as unknown as { cleanup: () => void }).cleanup();
      }
    };
  }, []);

  return <>{children}</>;
}

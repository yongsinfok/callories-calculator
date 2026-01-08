"use client";

import { useEffect } from "react";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize custom service worker handling
    const initSW = async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) return;

      try {
        // Wait for next-pwa to register the service worker
        // Then add our custom update handling
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration) {
          // Check user's preference for auto-update
          const autoUpdate = localStorage.getItem("pwa-auto-update") === "true";

          // Function to check for updates
          const checkForUpdates = async () => {
            try {
              await registration.update();
            } catch {
              // Ignore update failures (might be offline)
            }
          };

          // Listen for the waiting service worker
          const showUpdateIfWaiting = () => {
            if (registration.waiting) {
              if (autoUpdate) {
                // Automatically activate new service worker
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              } else {
                window.dispatchEvent(new CustomEvent("sw-update-available"));
              }
            }
          };

          // Check if there's already a waiting service worker
          showUpdateIfWaiting();

          // Listen for new service worker installation
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && registration.waiting) {
                // New version is ready
                if (autoUpdate) {
                  // Auto-update: skip waiting and reload
                  registration.waiting.postMessage({ type: "SKIP_WAITING" });
                } else {
                  window.dispatchEvent(new CustomEvent("sw-update-available"));
                }
              }
            });
          });

          // Handle messages from service worker (for skipWaiting response)
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data?.type === "SKIP_WAITING") {
              // Service worker is activating, reload the page
              window.location.reload();
            }
          });

          // Check for updates when window gets focus
          const handleFocus = () => {
            checkForUpdates();
          };
          window.addEventListener("focus", handleFocus);

          // Periodic update check (every 10 minutes)
          const updateInterval = setInterval(checkForUpdates, 10 * 60 * 1000);

          // Initial check after a short delay
          setTimeout(checkForUpdates, 5000);

          return () => {
            window.removeEventListener("focus", handleFocus);
            clearInterval(updateInterval);
          };
        }
      } catch (error) {
        console.error("[PWA] Error setting up service worker:", error);
      }
    };

    // Initialize after a short delay to ensure next-pwa has registered
    const timer = setTimeout(initSW, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}

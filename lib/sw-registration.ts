// Custom service worker registration with update handling
// This file is loaded by next-pwa's register option

type ServiceWorkerRegistrationWithWaiting = ServiceWorkerRegistration & {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
};

let registration: ServiceWorkerRegistrationWithWaiting | null = null;

// Check for service worker updates
function checkForUpdates() {
  if (!registration) return;

  // Force update check
  registration.update().catch(() => {
    // Update check failed, might be offline
  });
}

// Setup service worker update listener
function setupUpdateListener() {
  if (!registration) return;

  // Listen for new service worker installing
  registration.addEventListener("updatefound", () => {
    const newWorker = registration!.installing;

    if (!newWorker) return;

    // When the new service worker is installed
    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && registration!.waiting) {
        // New service worker is waiting to activate
        // Show the update prompt
        window.dispatchEvent(new CustomEvent("sw-update-available"));
      }
    });
  });

  // If there's already a waiting service worker (user didn't refresh after last update)
  if (registration.waiting) {
    // Show the update prompt
    window.dispatchEvent(new CustomEvent("sw-update-available"));
  }

  // Listen for messages from the service worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
      // Service worker is skipping waiting, reload the page
      window.location.reload();
    }
  });
}

// Register service worker with custom handling
export async function registerSW() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Wait for the page to fully load
  if (document.readyState === "loading") {
    await new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  try {
    // Get the existing registration (created by next-pwa)
    const reg = await navigator.serviceWorker.getRegistration();
    registration = reg || null;

    if (registration) {
      // Setup update listener
      setupUpdateListener();

      // Periodically check for updates (every 1 hour)
      setInterval(checkForUpdates, 60 * 60 * 1000);

      // Also check when the window gains focus (user returns to the tab)
      window.addEventListener("focus", checkForUpdates);

      console.log("[PWA] Custom service worker registration loaded");
    }
  } catch (error) {
    console.error("[PWA] Service worker registration error:", error);
  }
}

// Skip waiting and activate new service worker
export function skipWaiting() {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

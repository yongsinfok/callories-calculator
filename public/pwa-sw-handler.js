// Custom service worker logic for PWA update handling
// This file is used by next-pwa as swSrc

// Placeholder for next-pwa to inject the precache manifest
// prettier-ignore
self.__WB_MANIFEST = [];

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    // Skip the waiting phase and activate the new service worker immediately
    self.skipWaiting();
  }
});

// Immediately claim all clients when activating
self.addEventListener("activate", (event) => {
  // Take control of all open pages immediately
  event.waitUntil(self.clients.claim());
});

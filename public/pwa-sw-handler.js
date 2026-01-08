// Custom service worker logic for handling updates
// This is appended to the auto-generated service worker by next-pwa

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

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: false, // We'll handle skipWaiting manually for better UX
  disable: process.env.NODE_ENV === "development",
  swSrc: "public/pwa-sw-handler.js",
  // Add custom service worker logic for update handling
  buildExcludes: ["middleware-manifest.json"],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["xyzsupabase.com", "supabase.com"],
  },
};

module.exports = withPWA(nextConfig);

import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "热量追踪器 - AI驱动的智能热量追踪",
  description: "通过AI拍照识别，轻松记录饮食，达成健康目标",
  manifest: "/manifest.json",
  themeColor: "#FF6B35",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "热量追踪器",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${outfit.variable} ${plusJakartaSans.variable}`}>
        <ThemeProvider>
          <PWAProvider>
            <SupabaseProvider>{children}</SupabaseProvider>
            <PWAUpdatePrompt />
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

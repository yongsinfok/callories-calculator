"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, X, Upload, Sparkles } from "lucide-react";

export default function CameraPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    // For demo, we'll use file upload
    // In production, you'd integrate with device camera API
    fileInputRef.current?.click();
  };

  const handleAnalyze = () => {
    if (preview) {
      // Store image in sessionStorage instead of URL parameter
      sessionStorage.setItem("foodImage", preview);
      router.push("/confirm");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-semibold">拍照记录</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="h-screen flex flex-col">
        {preview ? (
          // Preview mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 relative">
              <img
                src={preview}
                alt="Food preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom controls */}
            <div className="bg-white rounded-t-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-primary bg-primary/10 p-4 rounded-xl">
                <Sparkles className="w-5 h-5" />
                <p className="text-sm">
                  AI 将自动识别食物并计算热量
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPreview(null)}
                  className="btn-secondary flex-1"
                >
                  重新拍摄
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    "分析中..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      开始识别
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Camera mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            {/* Viewfinder */}
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-2xl" />
              </div>

              {/* Corner indicators */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl" />

              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

              {/* Tips */}
              <div className="absolute bottom-12 left-0 right-0 text-center">
                <p className="text-white/80 text-sm">
                  确保光线充足，食物清晰可见
                </p>
              </div>
            </div>

            {/* Capture button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCapture}
              className="mt-8 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
            >
              <Camera className="w-8 h-8 text-black" />
            </motion.button>

            {/* Upload option */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>从相册选择</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

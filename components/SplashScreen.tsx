"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SplashScreenProps = {
  onComplete?: () => void;
};

const LOGO_SRC = "/logo/yeshua-christ.png";
const ICON_SRC = "/icons/icon-192x192.png";
const DURATION_MS = 3200;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Always show on refresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldShow(true);

    const timeout = window.setTimeout(() => {
      setShouldShow(false);
      onComplete?.();
    }, DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 dark:from-black dark:via-stone-950 dark:to-black">
      <div className="text-center space-y-6">
        <div className="yc-splash-logo">
          <Image
            src={ICON_SRC}
            alt="Yeshua-Christ"
            width={192}
            height={192}
            priority
            className="rounded-2xl shadow-lg mx-auto drop-shadow-2xl animate-bounce"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-amber-300">
            Yeshua-Christ
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xs mx-auto">
            &ldquo;For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.&rdquo;
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500">
            John 3:16
          </p>
        </div>
        <div>
          <div className="w-8 h-8 border-2 border-stone-400 dark:border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

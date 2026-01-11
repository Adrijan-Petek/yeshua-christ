"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SplashScreenProps = {
  onComplete?: () => void;
};

const LOGO_SRC = "/logo/yeshua-christ.png";
const STORAGE_KEY = "yc_splash_seen";
const DURATION_MS = 3200;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY);
      if (seen) return;

      sessionStorage.setItem(STORAGE_KEY, "1");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldShow(true);

      const timeout = window.setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, DURATION_MS);

      return () => window.clearTimeout(timeout);
    } catch {
      // If sessionStorage is unavailable, we just skip the splash.
      return;
    }
  }, [onComplete]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-stone-50 dark:bg-black">
      <div className="yc-splash-logo">
        <Image
          src={LOGO_SRC}
          alt="Yeshua-Christ"
          width={220}
          height={220}
          priority
          className="rounded-2xl shadow-sm"
        />
      </div>
    </div>
  );
}

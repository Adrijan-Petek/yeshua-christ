"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SplashScreen from "../components/SplashScreen";
import DailyVerse from "../components/DailyVerse";

export default function Home() {
  const [shareUrl, setShareUrl] = useState("https://github.com/Adrijan-Petek/yeshua-christ");

  useEffect(() => {
    setShareUrl(window.location.origin);
  }, []);

  const addMiniAppHref = useMemo(
    () =>
      `https://warpcast.com/~/compose?text=${encodeURIComponent(
        `Add this mini app ✝️\n\n${shareUrl}\n\n#YeshuaChrist`,
      )}`,
    [shareUrl],
  );

  const recastAppHref = useMemo(
    () =>
      `https://warpcast.com/~/compose?text=${encodeURIComponent(
        `Recast / share this app ✝️\n\n${shareUrl}\n\n#YeshuaChrist`,
      )}`,
    [shareUrl],
  );

  return (
    <div>
      <SplashScreen />

      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-8">
          <Image
            src="/icons/icon-150x150.png"
            alt="Yeshua-Christ"
            width={150}
            height={150}
            priority
            className="rounded-3xl shadow-lg"
          />
        </div>

        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-stone-700 dark:text-stone-200">
          “A place to share faith, the Gospel, and the Word of God freely.”
        </p>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 max-w-lg">
          <Link
            href="/faith"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-900 shadow-md transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Go to Faith
          </Link>
          <Link
            href="/videos"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-900 shadow-md transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Go to Videos
          </Link>
          <Link
            href="/bible"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-900 shadow-md transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Go to Bible
          </Link>
        </div>

        <div className="mt-12 w-full max-w-2xl">
          <DailyVerse />
        </div>

        <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href={addMiniAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-900 shadow-md transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Add Mini App
          </a>
          <a
            href={recastAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-900 shadow-md transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Recast App
          </a>
        </div>
      </section>
    </div>
  );
}

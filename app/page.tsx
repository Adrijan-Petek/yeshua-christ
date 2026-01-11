"use client";

import Image from "next/image";
import Link from "next/link";
import SplashScreen from "../components/SplashScreen";
import DailyVerse from "../components/DailyVerse";

const LOGO_SRC = "/logo/yeshua-christ.png";

export default function Home() {
  return (
    <div>
      <SplashScreen />

      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-8">
          <Image
            src="/logo/yeshua-christ-header.png"
            alt="Yeshua-Christ"
            width={160}
            height={64}
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
      </section>
    </div>
  );
}

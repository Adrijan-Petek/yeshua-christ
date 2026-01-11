"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import SplashScreen from "../components/SplashScreen";
import DailyVerse from "../components/DailyVerse";
import { buildWarpcastComposeUrl, tryAddMiniApp, tryComposeCast } from "../lib/farcasterShare";

export default function Home() {
  const shareUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://github.com/Adrijan-Petek/yeshua-christ";

  const shareEmbeds = useMemo(() => [shareUrl], [shareUrl]);

  const addMiniAppHref = useMemo(
    () =>
      buildWarpcastComposeUrl({
        text: `Add this mini app\n\n${shareUrl}\n\n#YeshuaChrist`,
        embeds: shareEmbeds,
      }),
    [shareEmbeds, shareUrl],
  );

  const recastAppHref = useMemo(
    () =>
      buildWarpcastComposeUrl({
        text: `Recast / share this app\n\n${shareUrl}\n\n#YeshuaChrist`,
        embeds: shareEmbeds,
      }),
    [shareEmbeds, shareUrl],
  );

  const onAddMiniAppClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const added = await tryAddMiniApp();
      if (added) return;

      const ok = await tryComposeCast({
        text: `Add this mini app\n\n${shareUrl}\n\n#YeshuaChrist`,
        embeds: shareEmbeds,
      });

      if (!ok) window.open(addMiniAppHref, "_blank", "noopener,noreferrer");
    },
    [addMiniAppHref, shareEmbeds, shareUrl],
  );

  const onRecastAppClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const ok = await tryComposeCast({
        text: `Recast / share this app\n\n${shareUrl}\n\n#YeshuaChrist`,
        embeds: shareEmbeds,
      });

      if (!ok) window.open(recastAppHref, "_blank", "noopener,noreferrer");
    },
    [recastAppHref, shareEmbeds, shareUrl],
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
            onClick={onAddMiniAppClick}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-900 shadow-md transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Add Mini App
          </a>
          <a
            href={recastAppHref}
            onClick={onRecastAppClick}
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

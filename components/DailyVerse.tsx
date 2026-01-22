"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWarpcastComposeUrl, tryComposeCast } from "../lib/farcasterShare";
import { getLocalDateKey, getOfflineDailyVerse, type Verse } from "@/lib/dailyVerse";

const STORAGE_KEY = "yc.dailyVerse.v1";

type CachedDailyVerse = {
  dateKey: string;
  verse: Verse;
};

export default function DailyVerse() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const shareEmbeds = useMemo(() => (appUrl ? [appUrl] : []), [appUrl]);

  useEffect(() => {
    const fetchDailyVerse = async () => {
      const dateKey = getLocalDateKey();

      try {
        const cachedRaw = localStorage.getItem(STORAGE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as CachedDailyVerse;
          if (cached?.dateKey === dateKey && cached?.verse?.reference && cached?.verse?.text) {
            setVerse(cached.verse);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore cache errors
      }

      try {
        const response = await fetch(`/api/daily-verse?dateKey=${encodeURIComponent(dateKey)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch daily verse");
        const data = (await response.json()) as Partial<Verse>;
        if (!data.reference || !data.text) throw new Error("Invalid daily verse payload");
        const nextVerse: Verse = {
          reference: data.reference,
          text: data.text,
          translation_name: data.translation_name ?? "KJV",
        };

        setVerse(nextVerse);
        try {
          const cached: CachedDailyVerse = { dateKey, verse: nextVerse };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
        } catch {
          // ignore cache errors
        }
      } catch {
        const offline = getOfflineDailyVerse(dateKey);
        setVerse(offline);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVerse();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-sm text-stone-600 dark:text-stone-400">Loading daily verse...</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold text-stone-950 dark:text-amber-300">Daily Verse</h2>
      {verse && (
        <div className="space-y-2">
          <p className="text-lg italic text-stone-800 dark:text-stone-200">&ldquo;{verse.text}&rdquo;</p>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{verse.reference}</p>
          <p className="text-xs text-stone-600 dark:text-stone-400">{verse.translation_name}</p>

          {(() => {
            const shareText = `${verse.reference} (${verse.translation_name})\n\n${verse.text}\n\n#YeshuaChrist`;
            const shareHref = buildWarpcastComposeUrl({ text: shareText, embeds: shareEmbeds });
            const onShareClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              const ok = await tryComposeCast({ text: shareText, embeds: shareEmbeds });
              if (!ok) window.open(shareHref, "_blank", "noopener,noreferrer");
            };

            return (
              <div className="pt-2">
                <a
                  href={shareHref}
                  onClick={onShareClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                >
                  Recast daily verse
                </a>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

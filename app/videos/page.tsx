"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWarpcastComposeUrl, tryComposeCast } from "../../lib/farcasterShare";

type VideoTab = "Worship Music" | "Teaching Videos";

type VideoEntry = {
  id: string;
  originalUrl: string;
  shareUrl: string;
  embedUrl: string;
  tab: VideoTab;
};

const TABS: VideoTab[] = ["Worship Music", "Teaching Videos"];
const STORAGE_KEY = "yc.videos.v2";

function parseTimeToSeconds(raw: string | null): number | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();

  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (/^\d+s$/.test(trimmed)) return Number(trimmed.slice(0, -1));

  const match = trimmed.match(/^((\d+)h)?((\d+)m)?((\d+)s)?$/);
  if (!match) return null;

  const hours = match[2] ? Number(match[2]) : 0;
  const minutes = match[4] ? Number(match[4]) : 0;
  const seconds = match[6] ? Number(match[6]) : 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return Number.isFinite(total) && total > 0 ? total : null;
}

function buildYouTubeEmbedUrl(videoId: string, startSeconds: number | null): string {
  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  if (startSeconds && startSeconds > 0) url.searchParams.set("start", String(startSeconds));
  return url.toString();
}

function buildYouTubeWatchUrl(videoId: string, startSeconds: number | null): string {
  const url = new URL("https://www.youtube.com/watch");
  url.searchParams.set("v", videoId);
  if (startSeconds && startSeconds > 0) url.searchParams.set("t", `${startSeconds}s`);
  return url.toString();
}

function parseYouTube(input: string): { embedUrl: string; shareUrl: string } | null {
  try {
    const url = new URL(input.trim());

    const hostname = url.hostname.replace(/^www\./, "");

    const playlistId = url.searchParams.get("list");
    const videoIdFromQuery = url.searchParams.get("v");
    const startSeconds = parseTimeToSeconds(url.searchParams.get("t") ?? url.searchParams.get("start"));

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { embedUrl: buildYouTubeEmbedUrl(id, startSeconds), shareUrl: buildYouTubeWatchUrl(id, startSeconds) };
    }

    if (hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch" && videoIdFromQuery) {
        return {
          embedUrl: buildYouTubeEmbedUrl(videoIdFromQuery, startSeconds),
          shareUrl: buildYouTubeWatchUrl(videoIdFromQuery, startSeconds),
        };
      }

      if (url.pathname === "/playlist" && playlistId) {
        return {
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
          shareUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
        };
      }

      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/").filter(Boolean)[1];
        if (!id) return null;
        return {
          embedUrl: buildYouTubeEmbedUrl(id, startSeconds),
          shareUrl: buildYouTubeWatchUrl(id, startSeconds),
        };
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/").filter(Boolean)[1];
        if (!id) return null;
        const share = new URL(`https://www.youtube.com/shorts/${id}`);
        if (startSeconds && startSeconds > 0) share.searchParams.set("t", `${startSeconds}s`);
        return { embedUrl: buildYouTubeEmbedUrl(id, startSeconds), shareUrl: share.toString() };
      }

      if (playlistId) {
        return {
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
          shareUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function VideosPage() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<VideoTab>("Worship Music");
  const [activeTab, setActiveTab] = useState<VideoTab>("Worship Music");
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoEntry[]>(() => {
    const seed: VideoEntry[] = [
      {
        id: "default-worship-playlist",
        originalUrl: "https://youtube.com/playlist?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M&si=K0jzitUVp0fNZtB0",
        shareUrl: "https://youtube.com/playlist?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M",
        embedUrl: "https://www.youtube.com/embed/videoseries?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M",
        tab: "Worship Music",
      },
      {
        id: "default-teaching-video-1",
        originalUrl: "https://www.youtube.com/watch?v=zemc1D9lOIk&t=12405s",
        shareUrl: "https://www.youtube.com/watch?v=zemc1D9lOIk&t=12405s",
        embedUrl: buildYouTubeEmbedUrl("zemc1D9lOIk", 12405),
        tab: "Teaching Videos",
      },
    ];

    if (typeof window === "undefined") return seed;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { videos?: VideoEntry[] };
        if (Array.isArray(parsed?.videos) && parsed.videos.length > 0) return parsed.videos;
      }
    } catch {
      // ignore
    }

    return seed;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(!!localStorage.getItem("yc_admin_rules"));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (videos.length === 0) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ videos }));
    } catch {
      // ignore
    }
  }, [videos]);

  const canAdd = useMemo(() => input.trim().length > 0, [input]);

  function add() {
    setError(null);
    const parsed = parseYouTube(input);
    if (!parsed) {
      setError("Please paste a valid YouTube video or playlist link.");
      return;
    }

    const entry: VideoEntry = {
      id: crypto.randomUUID(),
      originalUrl: input.trim(),
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      tab,
    };

    setVideos((prev) => [entry, ...prev]);
    setInput("");
  }

  const visibleVideos = useMemo(() => videos.filter((v) => v.tab === activeTab), [activeTab, videos]);

  return (
    <div className="space-y-6 px-4">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-950 dark:text-amber-300">
          Videos
        </h1>
        <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300">
          Share worship music videos that glorify Christ.
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t === activeTab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium shadow-sm transition-colors ${
                isActive
                  ? "border-stone-300 bg-stone-100 text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                  : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-black dark:text-stone-300 dark:hover:bg-stone-950"
              }`}
            >
              {t}
            </button>
          );
        })}
      </section>

      {isAdmin && (
      <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <h2 className="mb-3 text-base sm:text-lg font-semibold">Add a YouTube link</h2>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_150px_110px]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube video or playlist link"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
          />

          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as VideoTab)}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
          >
            {TABS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={add}
            disabled={!canAdd}
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            Embed
          </button>
        </div>

        {error && <p className="mt-2 text-xs sm:text-sm text-red-700">{error}</p>}
      </section>
      )}

      <section className="space-y-3.5">
        {visibleVideos.length === 0 && (
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">No videos added yet.</p>
        )}

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleVideos.map((v) => {
            const isPlaylist = v.embedUrl.includes('videoseries');

            const shareText = `Be encouraged in Christ\n\n#YeshuaChrist`;
            const shareEmbeds = [v.shareUrl, appUrl].filter(Boolean) as string[];
            const shareHref = buildWarpcastComposeUrl({ text: `${shareText}\n\n${v.shareUrl}`, embeds: shareEmbeds });

            const onShareClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              const ok = await tryComposeCast({ text: `${shareText}\n\n${v.shareUrl}`, embeds: shareEmbeds });
              if (!ok) window.open(shareHref, "_blank", "noopener,noreferrer");
            };

            return (
            <article
              key={v.id}
              className={`overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-black ${
                isPlaylist ? 'sm:col-span-2 lg:col-span-3' : ''
              }`}
            >
              <div className="w-full bg-stone-100 dark:bg-black" style={{ height: isPlaylist ? '450px' : '280px' }}>
                <iframe
                  className="h-full w-full"
                  src={v.embedUrl}
                  title="YouTube embed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="space-y-2.5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {v.tab}
                  </span>
                  <a
                    href={v.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-600 underline underline-offset-4 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    Open on YouTube
                  </a>
                </div>

                <a
                  href={shareHref}
                  onClick={onShareClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  Share on Farcaster
                </a>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

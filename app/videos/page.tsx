"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWarpcastComposeUrl, tryComposeCast } from "../../lib/farcasterShare";
import { parseVideoUrl } from "@/lib/videoUrl";

type VideoTab = "Worship Music" | "Teaching Videos";

type VideoEntry = {
  id: string;
  originalUrl: string;
  shareUrl: string;
  embedUrl: string;
  tab: VideoTab;
};

const TABS: VideoTab[] = ["Worship Music", "Teaching Videos"];

export default function VideosPage() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<VideoTab>("Worship Music");
  const [activeTab, setActiveTab] = useState<VideoTab>("Worship Music");
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/videos", { cache: "no-store" });
        const data = (await response.json()) as { videos?: VideoEntry[]; error?: string };
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        if (!cancelled) setVideos(Array.isArray(data.videos) ? data.videos : []);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unable to load videos.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }

      try {
        const res = await fetch("/api/admin", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { isAdmin?: unknown };
        if (!cancelled) setIsAdmin(json.isAdmin === true);
      } catch {
        // ignore
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const canAdd = useMemo(() => input.trim().length > 0, [input]);

  async function add() {
    setError(null);
    const parsed = parseVideoUrl(input);
    if (!parsed) {
      setError("Please paste a valid YouTube or Facebook video link.");
      return;
    }

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input.trim(), tab }),
      });

      const data = (await response.json()) as { video?: VideoEntry; error?: string };
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      if (data.video) setVideos((prev) => [data.video!, ...prev]);
      setInput("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to add video.";
      setError(message);
    }
  }

  async function removeVideo(id: string) {
    setError(null);
    if (!window.confirm("Remove this link from the app?")) return;

    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to remove video.";
      setError(message);
    }
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
        <h2 className="mb-3 text-base sm:text-lg font-semibold">Add a link</h2>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_150px_110px]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube or Facebook video link"
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
        {loading && <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">Loading…</p>}

        {visibleVideos.length === 0 && (
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">No videos added yet.</p>
        )}

        {error && <p className="text-xs sm:text-sm text-red-700">{error}</p>}

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

            const sourceLabel = (() => {
              try {
                const hostname = new URL(v.shareUrl).hostname.replace(/^www\./, "");
                if (hostname === "facebook.com" || hostname.endsWith(".facebook.com") || hostname === "fb.watch") {
                  return "Open on Facebook";
                }
              } catch {
                // ignore
              }
              return "Open on YouTube";
            })();

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
                  title="Video embed"
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
                  <div className="flex items-center gap-3">
                    <a
                      href={v.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-600 underline underline-offset-4 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                    >
                      {sourceLabel}
                    </a>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeVideo(v.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 shadow-sm hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
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

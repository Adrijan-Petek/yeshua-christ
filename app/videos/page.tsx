"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "Sermon" | "Worship" | "Testimony" | "Bible Study";

type VideoEntry = {
  id: string;
  originalUrl: string;
  embedUrl: string;
  category: Category;
};

const categories: Category[] = ["Sermon", "Worship", "Testimony", "Bible Study"];

function composeUrl(text: string) {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}

function parseYouTube(input: string): { embedUrl: string } | null {
  try {
    const url = new URL(input.trim());

    const hostname = url.hostname.replace(/^www\./, "");

    const playlistId = url.searchParams.get("list");
    const videoIdFromQuery = url.searchParams.get("v");

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { embedUrl: `https://www.youtube.com/embed/${id}` };
    }

    if (hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch" && videoIdFromQuery) {
        return { embedUrl: `https://www.youtube.com/embed/${videoIdFromQuery}` };
      }

      if (url.pathname === "/playlist" && playlistId) {
        return { embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}` };
      }

      if (url.pathname.startsWith("/embed/")) {
        return { embedUrl: `https://www.youtube.com${url.pathname}` };
      }

      if (url.pathname === "/shorts") {
        const id = url.pathname.split("/").filter(Boolean)[1];
        if (!id) return null;
        return { embedUrl: `https://www.youtube.com/embed/${id}` };
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/").filter(Boolean)[1];
        if (!id) return null;
        return { embedUrl: `https://www.youtube.com/embed/${id}` };
      }

      if (playlistId) {
        return { embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}` };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function VideosPage() {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<Category>("Sermon");
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoEntry[]>([
    {
      id: "default-playlist",
      originalUrl: "https://youtube.com/playlist?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M&si=K0jzitUVp0fNZtB0",
      embedUrl: "https://www.youtube.com/embed/videoseries?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M",
      category: "Bible Study",
    },
  ]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(!!localStorage.getItem("yc_admin_rules"));
    } catch {
      // ignore
    }
  }, []);

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
      embedUrl: parsed.embedUrl,
      category,
    };

    setVideos((prev) => [entry, ...prev]);
    setInput("");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-amber-300">
          Videos
        </h1>
        <p className="text-stone-700 dark:text-stone-300">
          Share worship music videos that glorify Christ.
        </p>
      </header>

      {isAdmin && (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <h2 className="mb-3 text-lg font-semibold">Add a YouTube link</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_120px]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube video or playlist link"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={add}
            disabled={!canAdd}
            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            Embed
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </section>
      )}

      <section className="space-y-4">
        {videos.length === 0 && (
          <p className="text-sm text-stone-600 dark:text-stone-400">No videos added yet.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const isPlaylist = v.embedUrl.includes('videoseries');
            return (
            <article
              key={v.id}
              className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-black ${
                isPlaylist ? 'sm:col-span-2 lg:col-span-3' : ''
              }`}
            >
              <div className="w-full bg-stone-100 dark:bg-black" style={{ height: '360px' }}>
                <iframe
                  className="h-full w-full"
                  src={v.embedUrl}
                  title="YouTube embed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {v.category}
                  </span>
                  <a
                    href={v.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-600 underline underline-offset-4 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    Open on YouTube
                  </a>
                </div>

                <a
                  href={composeUrl(
                    `Be encouraged in Christ ✝️\n\n${v.originalUrl}\n\n#YeshuaChrist`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
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

"use client";

import { useEffect, useMemo, useState } from "react";

type WarpcastAuthor = {
  username?: string;
  displayName?: string;
};

type WarpcastCast = {
  hash: string;
  text?: string;
  timestamp?: number;
  author?: WarpcastAuthor;
  reactions?: { count?: number };
  replies?: { count?: number };
  recasts?: { count?: number };
};

const PREFILL_TEXT = "Sharing faith ✝️ #YeshuaChrist";

function composeUrl(text: string) {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}

function castUrl(hash: string) {
  return `https://warpcast.com/~/cast/${hash}`;
}

export default function FaithPage() {
  const [casts, setCasts] = useState<WarpcastCast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState("Christ-centered content only\nNo politics\nNo financial promotion");

  useEffect(() => {
    const saved = localStorage.getItem("yc_admin_rules");
    if (saved) setRules(saved);
  }, []);

  const query = useMemo(() => "#YeshuaChrist", []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/farcaster?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { casts?: WarpcastCast[] };
        if (!cancelled) setCasts(Array.isArray(data.casts) ? data.casts : []);
      } catch {
        if (!cancelled) setError("Unable to load the feed right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-amber-300">
          Faith &amp; Testimony
        </h1>
        <p className="text-stone-700 dark:text-stone-300">
          Share encouragement, Scripture, and testimony — Christ-centered and respectful.
        </p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Post on Farcaster</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Opens Warpcast composer with a prefilled message.
            </p>
          </div>
          <a
            href={composeUrl(PREFILL_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            Post on Farcaster
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <h2 className="mb-2 text-lg font-semibold">Community Rules</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700 dark:text-stone-300">
          {rules.split('\n').map((rule, i) => rule.trim() && <li key={i}>{rule}</li>)}
        </ul>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Farcaster Feed</h2>
          <a
            href={`https://warpcast.com/~/search?q=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone-600 underline underline-offset-4 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Open on Warpcast
          </a>
        </div>

        {loading && <p className="text-sm text-stone-600 dark:text-stone-400">Loading…</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && casts.length === 0 && (
          <p className="text-sm text-stone-600 dark:text-stone-400">No casts found for {query} yet.</p>
        )}

        <div className="space-y-3">
          {casts.slice(0, 12).map((cast) => (
            <a
              key={cast.hash}
              href={castUrl(cast.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
            >
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600">
                <span className="font-medium text-stone-700">
                  {cast.author?.displayName || cast.author?.username || "Unknown"}
                </span>
                {cast.author?.username && <span>@{cast.author.username}</span>}
              </div>
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-medium text-stone-700 dark:text-stone-200">
                  {cast.author?.displayName || cast.author?.username || "Unknown"}
                </span>
                {cast.author?.username && <span>@{cast.author.username}</span>}
              </div>
              <p className="whitespace-pre-wrap text-sm text-stone-900 dark:text-stone-100">{cast.text || ""}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-600 dark:text-stone-400">
                <span>Replies: {cast.replies?.count ?? 0}</span>
                <span>Reactions: {cast.reactions?.count ?? 0}</span>
                <span>Recasts: {cast.recasts?.count ?? 0}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

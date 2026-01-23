"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWarpcastComposeUrl, tryComposeCast } from "../../lib/farcasterShare";

type BibleIndex = {
  bookNames: string[];
  chaptersByBook: Record<string, number[]>;
  rawByBookChapter: Record<string, Record<number, string>>;
};

type SelectedVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

const BOOKS: string[] = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

const BOOK_ALIASES: Record<string, string> = {
  "The Revelation": "Revelation",
};

function parseChapterVerses(raw: string): Record<number, string> {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.trim().length > 0);

  const bookSet = new Set(BOOKS);
  const cleaned: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    if (/^\d+$/.test(t)) continue;
    if (/^(?:CONTENTS|Contents)$/i.test(t)) continue;

    // Drop common PDF/TXT page headers like "4 Genesis" or "Genesis 5".
    const tokens = t.split(/\s+/);
    if (tokens.length === 2) {
      const [a, b] = tokens;
      if (/^\d+$/.test(a) && bookSet.has(b)) continue;
      if (bookSet.has(a) && /^\d+$/.test(b)) continue;
    }

    cleaned.push(line);
  }

  const text = cleaned.join("\n");

  // Preferred (CCEL/KJV-style) verse markers: lines starting with "^2And ...".
  const caretVerseRegex = /(?:^|\n)\^(\d{1,3})\s*/g;
  const caretMatches = Array.from(text.matchAll(caretVerseRegex));

  // Fallback for other TXT formats: verse numbers at line start or embedded after punctuation.
  // Example: "... earth. 12 And the earth ..."
  const fallbackVerseRegex = /(?:^|\n|[.?!]\s)(\d{1,3})\s+/g;
  const matches = caretMatches.length > 0 ? caretMatches : Array.from(text.matchAll(fallbackVerseRegex));

  const verses: Record<number, string> = {};

  if (matches.length === 0) {
    if (text.trim()) verses[1] = text.trim();
    return verses;
  }

  const first = matches[0];
  const firstVerseNumber = Number(first[1]);
  const firstStart = first.index ?? 0;
  const pre = text.slice(0, firstStart).trim();
  if (pre && firstVerseNumber !== 1) {
    verses[1] = pre;
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const verse = Number(current[1]);
    const start = (current.index ?? 0) + current[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    const body = text.slice(start, end).trim();
    if (body) verses[verse] = body;
  }

  return verses;
}

function parseBibleTxtToIndex(txt: string): BibleIndex {
  const lines = txt.split(/\r?\n/);
  const rawByBookChapter: BibleIndex["rawByBookChapter"] = {};

  let currentBook: string | null = null;
  let currentChapter: number | null = null;
  let chapterBuffer: string[] = [];

  function commitChapter() {
    if (!currentBook || !currentChapter) return;
    const raw = chapterBuffer.join("\n").trim();
    if (!raw) return;

    if (!rawByBookChapter[currentBook]) rawByBookChapter[currentBook] = {};
    rawByBookChapter[currentBook][currentChapter] = raw;
  }

  const bookSet = new Set(BOOKS);

  for (const rawLine of lines) {
    const rawTrimmed = rawLine.trim();
    if (!rawTrimmed) continue;

    const line = BOOK_ALIASES[rawTrimmed] ?? rawTrimmed;

    if (bookSet.has(line)) {
      commitChapter();
      currentBook = line;
      currentChapter = null;
      chapterBuffer = [];
      continue;
    }

    const chapMatch = line.match(/\bChapter\s+(\d{1,3})\b/i);
    if (chapMatch && currentBook) {
      commitChapter();
      currentChapter = Number(chapMatch[1]);
      chapterBuffer = [];
      continue;
    }

    if (currentBook && currentChapter) {
      chapterBuffer.push(rawLine);
    }
  }

  commitChapter();

  const bookNames = BOOKS.filter((b) => rawByBookChapter[b] && Object.keys(rawByBookChapter[b]).length > 0);
  const chaptersByBook: Record<string, number[]> = {};
  for (const b of bookNames) {
    const chapterNums = Object.keys(rawByBookChapter[b] ?? {})
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n))
      .sort((a, c) => a - c);
    chaptersByBook[b] = chapterNums;
  }

  return { bookNames, chaptersByBook, rawByBookChapter };
}

export default function BiblePage() {
  const [index, setIndex] = useState<BibleIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [readerTab, setReaderTab] = useState<"pdf" | "text">("pdf");
  const [rawTxt, setRawTxt] = useState<string>("");
  const [versesCache, setVersesCache] = useState<Record<string, Record<number, string>>>({});

  const [bookName, setBookName] = useState<string>("Genesis");
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [selected, setSelected] = useState<SelectedVerse | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const shareEmbeds = useMemo(() => (appUrl ? [appUrl] : []), [appUrl]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/bible/kjv.txt", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!cancelled) setRawTxt(text);
        const nextIndex = parseBibleTxtToIndex(text);
        if (cancelled) return;

        setIndex(nextIndex);
        const firstBook = nextIndex.bookNames[0] ?? "Genesis";
        setBookName(firstBook);
        const firstChapter = nextIndex.chaptersByBook[firstBook]?.[0] ?? 1;
        setChapterNumber(firstChapter);
        setSelected(null);
        setVersesCache({});
      } catch {
        if (!cancelled) setError("Could not load kjv.txt. Make sure it exists in public/bible/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const books = useMemo(() => index?.bookNames ?? [], [index]);
  const chapters = useMemo(() => (index ? index.chaptersByBook[bookName] ?? [] : []), [index, bookName]);
  const cacheKey = useMemo(() => `${bookName}::${chapterNumber}`, [bookName, chapterNumber]);
  const versesMap = useMemo(() => versesCache[cacheKey] ?? {}, [versesCache, cacheKey]);
  const verses = useMemo(() => {
    const entries = Object.entries(versesMap)
      .map(([k, v]) => [Number(k), v] as const)
      .filter(([n]) => Number.isFinite(n))
      .sort((a, b) => a[0] - b[0]);
    return entries;
  }, [versesMap]);

  useEffect(() => {
    if (!index) return;
    if (versesCache[cacheKey]) return;

    const raw = index.rawByBookChapter[bookName]?.[chapterNumber];
    if (!raw) return;

    const parsed = parseChapterVerses(raw);
    setVersesCache((prev) => ({ ...prev, [cacheKey]: parsed }));
  }, [index, versesCache, cacheKey, bookName, chapterNumber]);

  return (
    <div className="space-y-6 px-4">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-950 dark:text-amber-300">
          The Holy Bible
        </h1>
        <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300">Free to read and download. No tracking.</p>
      </header>

      <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <h2 className="mb-3 text-base sm:text-lg font-semibold">Free Downloads</h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <a
            href="/bible/kjv.pdf"
            download="KJV-Bible.pdf"
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-center text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            📥 Download PDF
          </a>
          <a
            href="/bible/kjv.doc"
            download="KJV-Bible.doc"
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-center text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            📥 Download DOCX
          </a>
          <a
            href="/bible/kjv.txt"
            download="KJV-Bible.txt"
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-center text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            📥 Download TXT
          </a>
        </div>
        <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
          Click buttons above to download Bible files for offline reading.
        </p>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Reader</h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">Choose PDF or verse-by-verse text.</p>
          </div>

          <div className="inline-flex w-full rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-black sm:w-auto">
            <button
              type="button"
              onClick={() => setReaderTab("pdf")}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
                readerTab === "pdf"
                  ? "bg-stone-100 text-stone-900 dark:bg-stone-900 dark:text-stone-100"
                  : "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-900"
              }`}
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => setReaderTab("text")}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
                readerTab === "text"
                  ? "bg-stone-100 text-stone-900 dark:bg-stone-900 dark:text-stone-100"
                  : "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-900"
              }`}
            >
              Text
            </button>
          </div>
        </div>

        {readerTab === "pdf" && (
          <div className="w-full">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/bible/kjv.pdf&embedded=true`}
              width="100%"
              height="650"
              className="rounded-lg border border-stone-200 dark:border-stone-700"
              title="Bible PDF Reader"
              style={{ border: 'none' }}
            />
            <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
              View the Bible directly in your browser. Use the download buttons above to save a copy.
            </p>
          </div>
        )}

        {readerTab === "text" && (
          <div className="space-y-4">
            DOC
            {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

            {!loading && !error && !index && (
              <p className="text-sm text-stone-600 dark:text-stone-400">
                No index available yet.
              </p>
            )}

            {!loading && !error && index && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    value={bookName}
                    onChange={(e) => {
                      const nextBook = e.target.value;
                      setBookName(nextBook);
                      const nextChapter = index.chaptersByBook[nextBook]?.[0] ?? 1;
                      setChapterNumber(nextChapter);
                      setSelected(null);
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                  >
                    {books.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>

                  <select
                    value={chapterNumber}
                    onChange={(e) => {
                      setChapterNumber(Number(e.target.value));
                      setSelected(null);
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                  >
                    {chapters.map((c) => (
                      <option key={c} value={c}>
                        Chapter {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
              {verses.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Verse parsing is not available for this chapter. Showing raw chapter text instead.
                  </p>
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
                    <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-stone-900 dark:text-stone-100">
                      {index.rawByBookChapter[bookName]?.[chapterNumber] ?? rawTxt}
                    </pre>
                  </div>
                </div>
              )}

              {verses.map(([n, text]) => {
                const isSelected =
                  selected?.book === bookName &&
                  selected?.chapter === chapterNumber &&
                  selected?.verse === n;
                const shareText = `The Holy Bible (KJV)\n${bookName} ${chapterNumber}:${n}\n\n${text}\n\n#YeshuaChrist`;
                const shareHref = buildWarpcastComposeUrl({ text: shareText, embeds: shareEmbeds });

                return (
                  <div key={n} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelected({ book: bookName, chapter: chapterNumber, verse: n, text })}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition-colors ${
                        isSelected
                          ? "border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-800"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100 dark:border-stone-700 dark:bg-black dark:hover:bg-stone-800"
                      }`}
                    >
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{n}</span>
                      <span className="ml-3 text-stone-800 dark:text-stone-200">{text}</span>
                    </button>

                    {isSelected && (
                      <a
                        href={shareHref}
                        onClick={async (e) => {
                          e.preventDefault();
                          const ok = await tryComposeCast({ text: shareText, embeds: shareEmbeds });
                          if (!ok) window.open(shareHref, "_blank", "noopener,noreferrer");
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                      >
                        Share to Farcaster
                      </a>
                    )}
                  </div>
                );
              })}
                </div>

                <div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Tip: tap a verse to select it for sharing.
                  </p>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Source: <span className="font-medium">public/bible/kjv.txt</span>
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

type Translation = "KJV" | "WEB";

type Chapter = {
  chapter: number;
  verses: Record<number, string>;
};

type Book = {
  name: string;
  chapters: Chapter[];
};

type BibleData = Record<Translation, Book[]>;

type SelectedVerse = {
  translation: Translation;
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

const bible: BibleData = {
  KJV: [
    {
      name: "Genesis",
      chapters: [
        {
          chapter: 1,
          verses: {
            1: "In the beginning God created the heaven and the earth.",
            2: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
            3: "And God said, Let there be light: and there was light.",
            4: "And God saw the light, that it was good: and God divided the light from the darkness.",
            5: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
          },
        },
      ],
    },
    {
      name: "John",
      chapters: [
        {
          chapter: 3,
          verses: {
            16: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
            17: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
          },
        },
      ],
    },
  ],
  WEB: [
    {
      name: "Genesis",
      chapters: [
        {
          chapter: 1,
          verses: {
            1: "In the beginning God created the heavens and the earth.",
            2: "The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters.",
            3: "God said, \"Let there be light,\" and there was light.",
            4: "God saw the light, and saw that it was good. God divided the light from the darkness.",
            5: "God called the light Day, and the darkness he called Night. There was evening and there was morning, the first day.",
          },
        },
      ],
    },
    {
      name: "John",
      chapters: [
        {
          chapter: 3,
          verses: {
            16: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
            17: "For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.",
          },
        },
      ],
    },
  ],
};

function composeUrl(text: string) {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}

export default function BiblePage() {
  const [translation, setTranslation] = useState<Translation>("KJV");

  const books = useMemo(() => bible[translation], [translation]);
  const [bookName, setBookName] = useState(books[0]?.name ?? "Genesis");

  const book = useMemo(
    () => books.find((b) => b.name === bookName) ?? books[0],
    [books, bookName],
  );

  const chapters = book?.chapters ?? [];
  const [chapterNumber, setChapterNumber] = useState(chapters[0]?.chapter ?? 1);

  const chapter = useMemo(
    () => chapters.find((c) => c.chapter === chapterNumber) ?? chapters[0],
    [chapters, chapterNumber],
  );

  const verses = useMemo(() => {
    const entries = Object.entries(chapter?.verses ?? {}).map(([k, v]) => [Number(k), v] as const);
    entries.sort((a, b) => a[0] - b[0]);
    return entries;
  }, [chapter]);

  const [selected, setSelected] = useState<SelectedVerse | null>(null);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">The Holy Bible</h1>
        <p className="text-stone-700 dark:text-stone-300">Free to read and download. No tracking.</p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <h2 className="mb-3 text-lg font-semibold">Free Downloads</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href="/bible/bible.pdf"
            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            PDF
          </a>
          <a
            href="/bible/bible.epub"
            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            EPUB
          </a>
          <a
            href="/bible/bible.txt"
            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            TXT
          </a>
        </div>
        <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
          Place your files in <span className="font-medium">public/bible/</span> with these names.
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-black">
        <h2 className="mb-4 text-lg font-semibold">Online Reading</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={translation}
            onChange={(e) => {
              const next = e.target.value as Translation;
              setTranslation(next);
              const firstBook = bible[next][0];
              setBookName(firstBook?.name ?? "Genesis");
              setChapterNumber(firstBook?.chapters[0]?.chapter ?? 1);
              setSelected(null);
            }}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
          >
            <option value="KJV">KJV</option>
            <option value="WEB">WEB</option>
          </select>

          <select
            value={bookName}
            onChange={(e) => {
              const nextBook = e.target.value;
              setBookName(nextBook);
              const b = books.find((x) => x.name === nextBook);
              setChapterNumber(b?.chapters[0]?.chapter ?? 1);
              setSelected(null);
            }}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
          >
            {books.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
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
              <option key={c.chapter} value={c.chapter}>
                Chapter {c.chapter}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {verses.map(([n, text]) => {
            const isSelected =
              selected?.translation === translation &&
              selected?.book === book?.name &&
              selected?.chapter === chapter?.chapter &&
              selected?.verse === n;

            return (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setSelected({
                    translation,
                    book: book?.name ?? "",
                    chapter: chapter?.chapter ?? 0,
                    verse: n,
                    text,
                  })
                }
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition-colors ${
                  isSelected
                    ? "border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-800"
                    : "border-stone-200 bg-stone-50 hover:bg-stone-100 dark:border-stone-700 dark:bg-black dark:hover:bg-stone-800"
                }`}
              >
                <span className="font-semibold text-stone-800 dark:text-stone-200">{n}</span>
                <span className="ml-3 text-stone-800 dark:text-stone-200">{text}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Tip: tap a verse to select it for sharing.
          </p>

          <a
            href={
              selected
                ? composeUrl(
                    `${selected.book} ${selected.chapter}:${selected.verse} (${selected.translation})\n\n${selected.text}\n\n#YeshuaChrist`,
                  )
                : "#"
            }
            onClick={(e) => {
              if (!selected) e.preventDefault();
            }}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium shadow-sm ${
              selected
                ? "border-stone-200 bg-stone-50 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                : "border-stone-200 bg-stone-50 opacity-50 dark:border-stone-700 dark:bg-stone-800"
            }`}
          >
            Share to Farcaster
          </a>
        </div>

        <p className="mt-4 text-xs text-stone-600 dark:text-stone-400">
          Note: this demo includes a small built-in sample for KJV/WEB. To add full text, replace the
          in-page dataset with your preferred public-domain source.
        </p>
      </section>
    </div>
  );
}

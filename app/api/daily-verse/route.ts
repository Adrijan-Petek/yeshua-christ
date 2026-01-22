import { NextResponse } from "next/server";
import { getLocalDateKey, getOfflineDailyVerse, toDailyBiblePath, type Verse } from "@/lib/dailyVerse";

type DailyVerseResponse = Verse & {
  dateKey: string;
  source: "offline" | "dailybible.ca" | "bible-api.com";
};

function isValidDateKey(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function parseDailyBibleVerse(data: unknown): Verse | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const reference = typeof record.reference === "string" ? record.reference : null;
  const text = typeof record.text === "string" ? record.text : null;
  const translation_name =
    typeof record.translation_name === "string" ? record.translation_name : null;
  if (!reference || !text || !translation_name) return null;
  return { reference, text: text.trim(), translation_name };
}

function parseBibleApiVerse(data: unknown): Verse | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const reference = typeof record.reference === "string" ? record.reference : null;
  const translation_name =
    typeof record.translation_name === "string" ? record.translation_name : "KJV";

  const directText = typeof record.text === "string" ? record.text : null;
  if (reference && directText) {
    return { reference, text: directText.trim(), translation_name };
  }

  const verses = Array.isArray(record.verses) ? record.verses : null;
  if (!reference || !verses) return null;
  const text = verses
    .map((v) => (v && typeof v === "object" ? (v as Record<string, unknown>).text : null))
    .filter((t): t is string => typeof t === "string")
    .join(" ")
    .trim();

  if (!text) return null;
  return { reference, text, translation_name };
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Bad status: ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dateKey = isValidDateKey(url.searchParams.get("dateKey"))
    ? url.searchParams.get("dateKey")!
    : getLocalDateKey();

  const fallback = getOfflineDailyVerse(dateKey);

  try {
    const dailyBibleData = await fetchJsonWithTimeout(
      `https://dailybible.ca/api/${toDailyBiblePath(fallback.reference)}`,
      4000,
    );
    const verse = parseDailyBibleVerse(dailyBibleData);
    if (verse) {
      const body: DailyVerseResponse = { ...verse, dateKey, source: "dailybible.ca" };
      return NextResponse.json(body, {
        headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch {
    // fall through
  }

  try {
    const bibleApiData = await fetchJsonWithTimeout(
      `https://bible-api.com/${encodeURIComponent(fallback.reference)}?translation=kjv`,
      4000,
    );
    const verse = parseBibleApiVerse(bibleApiData);
    if (verse) {
      const body: DailyVerseResponse = { ...verse, dateKey, source: "bible-api.com" };
      return NextResponse.json(body, {
        headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch {
    // fall through
  }

  const body: DailyVerseResponse = { ...fallback, dateKey, source: "offline" };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}


import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { parseVideoUrl } from "@/lib/videoUrl";
import { getAdminCookieName, getAdminFromSessionToken, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

type VideoTab = "Worship Music" | "Teaching Videos" | "TV Series";

type VideoDoc = {
  id: string;
  originalUrl: string;
  shareUrl: string;
  embedUrl: string;
  tab: VideoTab;
  title?: string;
  seasons?: number;
  createdAt: Date;
  createdByFid?: number;
};

function isVideoTab(value: unknown): value is VideoTab {
  return value === "Worship Music" || value === "Teaching Videos" || value === "TV Series";
}

const SEED_VIDEOS: Omit<VideoDoc, "createdAt" | "createdByFid">[] = [
  {
    id: "seed-worship-playlist",
    originalUrl: "https://youtube.com/playlist?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M&si=K0jzitUVp0fNZtB0",
    shareUrl: "https://www.youtube.com/playlist?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M",
    embedUrl: "https://www.youtube.com/embed/videoseries?list=PL6XvrC4XlCbwThPkcJCU8A6TdZO5cue5M",
    tab: "Worship Music",
  },
  {
    id: "seed-teaching-video-1",
    originalUrl: "https://www.youtube.com/watch?v=zemc1D9lOIk&t=12405s",
    shareUrl: "https://www.youtube.com/watch?v=zemc1D9lOIk&t=12405s",
    embedUrl: "https://www.youtube.com/embed/zemc1D9lOIk?start=12405",
    tab: "Teaching Videos",
  },
];

async function ensureSeedVideos() {
  const db = await getMongoDb();
  const collection = db.collection<VideoDoc>("videos");

  const existingCount = await collection.countDocuments({}, { limit: 1 });
  if (existingCount > 0) return;

  for (const seed of SEED_VIDEOS) {
    const parsed = parseVideoUrl(seed.originalUrl);
    if (!parsed) continue;

    await collection.updateOne(
      { shareUrl: parsed.shareUrl },
      {
        $setOnInsert: {
          id: seed.id,
          originalUrl: seed.originalUrl,
          shareUrl: parsed.shareUrl,
          embedUrl: parsed.embedUrl,
          tab: seed.tab,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
}

export async function GET() {
  try {
    await ensureSeedVideos();
    const db = await getMongoDb();
    const videos = await db
      .collection<VideoDoc>("videos")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ videos }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load videos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[getAdminCookieName()];
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await getAdminFromSessionToken(sessionToken);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
    tab?: unknown;
    title?: unknown;
    seasons?: unknown;
  } | null;

  const url = typeof body?.url === "string" ? body.url : null;
  const tab = body?.tab;
  if (!url || !isVideoTab(tab)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const rawTitle = typeof body?.title === "string" ? body.title.trim() : "";
  const rawSeasons = body?.seasons;
  const seasons =
    typeof rawSeasons === "number" && Number.isFinite(rawSeasons)
      ? Math.trunc(rawSeasons)
      : typeof rawSeasons === "string" && rawSeasons.trim().length > 0
        ? Math.trunc(Number(rawSeasons))
        : null;

  if (tab === "TV Series") {
    if (!rawTitle) {
      return NextResponse.json({ error: "Title is required for TV Series." }, { status: 400 });
    }
    if (seasons !== null && (!Number.isFinite(seasons) || seasons < 1 || seasons > 200)) {
      return NextResponse.json({ error: "Seasons must be a number between 1 and 200." }, { status: 400 });
    }
  } else {
    if (rawTitle || rawSeasons !== undefined) {
      return NextResponse.json({ error: "Title and seasons are only allowed for TV Series." }, { status: 400 });
    }
  }

  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: "Please provide a valid YouTube or Facebook link." }, { status: 400 });
  }

  const doc: VideoDoc = {
    id: crypto.randomUUID(),
    originalUrl: url.trim(),
    shareUrl: parsed.shareUrl,
    embedUrl: parsed.embedUrl,
    tab,
    ...(tab === "TV Series"
      ? {
          title: rawTitle,
          ...(seasons !== null ? { seasons } : {}),
        }
      : {}),
    createdAt: new Date(),
  };

  try {
    const db = await getMongoDb();
    await db.collection<VideoDoc>("videos").insertOne(doc);
    return NextResponse.json({ video: doc }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

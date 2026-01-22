import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { parseYouTubeUrl } from "@/lib/youtube";
import { getAdminCookieName, getAdminFromSessionToken, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

type VideoTab = "Worship Music" | "Teaching Videos";

type VideoDoc = {
  id: string;
  originalUrl: string;
  shareUrl: string;
  embedUrl: string;
  tab: VideoTab;
  createdAt: Date;
  createdByFid?: number;
};

function isVideoTab(value: unknown): value is VideoTab {
  return value === "Worship Music" || value === "Teaching Videos";
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

  for (const seed of SEED_VIDEOS) {
    const parsed = parseYouTubeUrl(seed.originalUrl);
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
  } | null;

  const url = typeof body?.url === "string" ? body.url : null;
  const tab = body?.tab;
  if (!url || !isVideoTab(tab)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = parseYouTubeUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: "Please provide a valid YouTube link." }, { status: 400 });
  }

  const doc: VideoDoc = {
    id: crypto.randomUUID(),
    originalUrl: url.trim(),
    shareUrl: parsed.shareUrl,
    embedUrl: parsed.embedUrl,
    tab,
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

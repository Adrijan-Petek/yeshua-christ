import { NextResponse } from "next/server";
import { Errors } from "@farcaster/quick-auth";
import { getMongoDb } from "@/lib/mongodb";
import { isAdminFid, requireFarcasterFid } from "@/lib/farcasterAuth";
import { parseYouTubeUrl } from "@/lib/youtube";

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

export async function GET() {
  try {
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
  let fid: number;
  try {
    fid = await requireFarcasterFid(request);
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }

  if (!isAdminFid(fid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    createdByFid: fid,
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

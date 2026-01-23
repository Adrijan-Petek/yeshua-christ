import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { getAdminCookieName, getAdminFromSessionToken, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

type VideoTab = "Worship Music" | "Teaching Videos" | "TV Series";

type VideoDoc = {
  id: string;
  tab: VideoTab;
  title?: string;
  episode?: number;
};

function isVideoTab(value: unknown): value is VideoTab {
  return value === "Worship Music" || value === "Teaching Videos" || value === "TV Series";
}

function parseSeriesTitle(rawTitle: string): string {
  const title = rawTitle.trim().replace(/\s+/g, " ");
  if (!title) return "";
  const match = title.match(/^(.*?)(?:\s*[-–—:]?\s*)?(?:episode|ep)\s*(\d+)\s*$/i);
  if (!match) return title;
  const seriesTitle = (match[1] ?? "").trim().replace(/\s+/g, " ");
  return seriesTitle || title;
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[getAdminCookieName()];
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await getAdminFromSessionToken(sessionToken);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    tab?: unknown;
    orderedIds?: unknown;
    title?: unknown;
  } | null;

  const tab = body?.tab;
  const orderedIdsRaw = body?.orderedIds;
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!isVideoTab(tab) || !Array.isArray(orderedIdsRaw)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const orderedIds = orderedIdsRaw.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
  if (orderedIds.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  const unique = new Set(orderedIds);
  if (unique.size !== orderedIds.length) {
    return NextResponse.json({ error: "Duplicate ids provided" }, { status: 400 });
  }

  try {
    const db = await getMongoDb();
    const collection = db.collection<VideoDoc>("videos");
    const existing = await collection
      .find({ id: { $in: orderedIds } }, { projection: { _id: 0, id: 1, tab: 1, title: 1 } })
      .toArray();

    if (existing.length !== orderedIds.length) {
      return NextResponse.json({ error: "Some ids were not found in this tab" }, { status: 400 });
    }

    for (const doc of existing) {
      if (doc.tab !== tab) {
        return NextResponse.json({ error: "Some ids were not found in this tab" }, { status: 400 });
      }
      if (tab === "TV Series" && title) {
        const docSeriesTitle = parseSeriesTitle(doc.title ?? "");
        if (docSeriesTitle !== title) {
          return NextResponse.json({ error: "Some ids were not found in this series title" }, { status: 400 });
        }
      }
    }

    const ops = orderedIds.map((id, idx) => ({
      updateOne: {
        filter: { id },
        update: { $set: { order: idx + 1, manualOrder: true } },
      },
    }));

    await collection.bulkWrite(ops, { ordered: true });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to reorder videos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

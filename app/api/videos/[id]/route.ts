import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { getAdminCookieName, getAdminFromSessionToken, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

type VideoDoc = {
  id: string;
};

export async function DELETE(request: Request, context: { params: Promise<{ id?: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[getAdminCookieName()];
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await getAdminFromSessionToken(sessionToken);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getMongoDb();
    const res = await db.collection<VideoDoc>("videos").deleteOne({ id });
    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


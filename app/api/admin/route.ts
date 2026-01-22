import { NextResponse } from "next/server";
import { Errors } from "@farcaster/quick-auth";
import { isAdminFid, requireFarcasterFid } from "@/lib/farcasterAuth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const fid = await requireFarcasterFid(request);
    return NextResponse.json({ isAdmin: isAdminFid(fid), fid }, { status: 200 });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }
}


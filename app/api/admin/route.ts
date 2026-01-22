import { NextResponse } from "next/server";
import { Errors } from "@farcaster/quick-auth";
import { isAdminFid, requireFarcasterFid } from "@/lib/farcasterAuth";
import { getAdminCookieName, getAdminFromSessionToken, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const token = cookies[getAdminCookieName()];
    if (token) {
      const admin = await getAdminFromSessionToken(token);
      if (admin) return NextResponse.json({ isAdmin: true, mode: "password" }, { status: 200 });
    }
  } catch {
    // ignore
  }

  const authorization = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!authorization) return NextResponse.json({ isAdmin: false }, { status: 200 });

  try {
    const fid = await requireFarcasterFid(request);
    return NextResponse.json({ isAdmin: isAdminFid(fid), fid }, { status: 200 });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}

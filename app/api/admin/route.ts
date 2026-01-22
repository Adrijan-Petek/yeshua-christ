import { NextResponse } from "next/server";
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
      if (admin) return NextResponse.json({ isAdmin: true }, { status: 200 });
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ isAdmin: false }, { status: 200 });
}

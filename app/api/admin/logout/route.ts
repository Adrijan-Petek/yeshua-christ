import { NextResponse } from "next/server";
import { deleteSessionToken, getAdminCookieName, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const token = cookies[getAdminCookieName()];

  if (token) await deleteSessionToken(token);

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}


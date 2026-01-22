import { NextResponse } from "next/server";
import {
  createAdminSession,
  deleteAllSessionsForUser,
  getAdminCookieName,
  getAdminFromSessionToken,
  getSessionDays,
  parseCookies,
  updateAdminPassword,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const token = cookies[getAdminCookieName()];
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await getAdminFromSessionToken(token);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { currentPassword?: unknown; newPassword?: unknown }
    | null;

  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : null;
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : null;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (newPassword.length < 10) {
    return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
  }

  const ok = await verifyAdminPassword(admin, currentPassword);
  if (!ok) return NextResponse.json({ error: "Invalid current password" }, { status: 400 });

  await updateAdminPassword(admin._id, newPassword);
  await deleteAllSessionsForUser(admin._id);

  const { token: nextToken, expiresAt } = await createAdminSession(admin._id);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(getAdminCookieName(), nextToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: getSessionDays() * 24 * 60 * 60,
    expires: expiresAt,
  });
  return res;
}


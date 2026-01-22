import { NextResponse } from "next/server";
import {
  createAdminSession,
  ensureBootstrapAdminUser,
  findAdminByEmail,
  getAdminCookieName,
  getSessionDays,
  normalizeEmail,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email : null;
  const password = typeof body?.password === "string" ? body.password : null;
  if (!email || !password) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await ensureBootstrapAdminUser();

  const user = await findAdminByEmail(email);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await verifyAdminPassword(user, password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const { token, expiresAt } = await createAdminSession(user._id);
  const res = NextResponse.json({ ok: true, email: normalizeEmail(email) }, { status: 200 });
  res.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: getSessionDays() * 24 * 60 * 60,
    expires: expiresAt,
  });
  return res;
}


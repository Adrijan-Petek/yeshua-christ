import { NextResponse } from "next/server";
import { Errors } from "@farcaster/quick-auth";
import { isAdminFid, requireFarcasterFid } from "@/lib/farcasterAuth";
import { createAdminUser, ensureBootstrapAdminUser, getAdminCookieName, getAdminFromSessionToken, parseCookies } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const revalidate = 0;

function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length >= 6 && v.length <= 254 && v.includes("@");
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[getAdminCookieName()];

  if (sessionToken) {
    const admin = await getAdminFromSessionToken(sessionToken);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    try {
      const fid = await requireFarcasterFid(request);
      if (!isAdminFid(fid)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (e) {
      if (e instanceof Errors.InvalidTokenError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
    }
  }

  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email : null;
  const password = typeof body?.password === "string" ? body.password : null;
  if (!email || !password) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });

  await ensureBootstrapAdminUser();

  try {
    const user = await createAdminUser(email, password);
    return NextResponse.json({ ok: true, email: user.emailLower }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create admin user";
    const status = message === "Admin user already exists" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}


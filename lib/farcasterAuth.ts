import { createClient, Errors } from "@farcaster/quick-auth";

const client = createClient();

export async function requireFarcasterFid(request: Request): Promise<number> {
  const authorization = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Errors.InvalidTokenError("Missing token");
  }

  const token = authorization.slice("Bearer ".length).trim();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const domain = host.split(":")[0];
  const payload = await client.verifyJwt({ token, domain });
  return payload.sub;
}

export function isAdminFid(fid: number): boolean {
  const configured = process.env.ADMIN_FIDS;
  if (!configured) return false;
  const allowed = configured
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
  return allowed.includes(fid);
}


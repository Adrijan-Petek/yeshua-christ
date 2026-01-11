import { createClient, Errors } from "@farcaster/quick-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const client = createClient();

async function resolvePrimaryEthereumAddress(fid: number): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return undefined;

    const json = (await res.json()) as {
      result?: {
        address?: {
          fid?: number;
          protocol?: "ethereum" | "solana";
          address?: string;
        };
      };
    };

    const address = json?.result?.address?.address;
    return typeof address === "string" && address.length > 0 ? address : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const token = authorization.slice("Bearer ".length).trim();

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const domain = host.split(":")[0];

  try {
    const payload = await client.verifyJwt({ token, domain });
    const fid = payload.sub;

    const primaryAddress = await resolvePrimaryEthereumAddress(fid);

    return NextResponse.json({ fid, primaryAddress }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }
}

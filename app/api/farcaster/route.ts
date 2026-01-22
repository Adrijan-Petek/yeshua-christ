import { NextResponse } from "next/server";

export const revalidate = 60;

const UPSTREAMS = [
  "https://client.farcaster.xyz/v2/search-casts",
  "https://client.warpcast.com/v2/search-casts",
] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "#YeshuaChrist";

  const normalizedQueries = Array.from(
    new Set([q, q.startsWith("#") ? q.slice(1) : q].map((s) => s.trim()).filter(Boolean)),
  );

  try {
    for (const upstream of UPSTREAMS) {
      for (const query of normalizedQueries) {
        const upstreamUrl = new URL(upstream);
        upstreamUrl.searchParams.set("q", query);
        upstreamUrl.searchParams.set("limit", "25");

        const upstreamResponse = await fetch(upstreamUrl.toString(), {
          headers: { accept: "application/json" },
          next: { revalidate },
        });

        if (!upstreamResponse.ok) continue;

        const data = (await upstreamResponse.json()) as { result?: { casts?: unknown[] } };
        const casts = Array.isArray(data?.result?.casts) ? data.result.casts : [];
        if (casts.length === 0) continue;

        return NextResponse.json({ casts }, { status: 200 });
      }
    }

    return NextResponse.json({ casts: [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}

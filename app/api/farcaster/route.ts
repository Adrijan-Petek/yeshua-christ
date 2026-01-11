import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "#YeshuaChrist";

  const upstreamUrl = new URL("https://client.warpcast.com/v2/search-casts");
  upstreamUrl.searchParams.set("q", q);

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: {
        accept: "application/json",
      },
      next: { revalidate },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${upstreamResponse.status}` },
        { status: 502 },
      );
    }

    const data = (await upstreamResponse.json()) as {
      result?: { casts?: unknown[] };
    };

    const casts = Array.isArray(data?.result?.casts) ? data.result.casts : [];

    return NextResponse.json({ casts }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}

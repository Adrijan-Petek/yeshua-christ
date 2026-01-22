import { NextResponse } from "next/server";

export const revalidate = 60;

const UPSTREAMS = [
  "https://client.farcaster.xyz/v2/search-casts",
  "https://client.warpcast.com/v2/search-casts",
] as const;

function uniqStrings(values: string[]) {
  return Array.from(new Set(values.map((s) => s.trim()).filter(Boolean)));
}

function camelToSpaced(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function expandQuery(input: string) {
  const raw = input.trim();
  const withoutHash = raw.startsWith("#") ? raw.slice(1) : raw;

  const variants = [raw, withoutHash];

  const spaced = camelToSpaced(withoutHash);
  if (spaced !== withoutHash) variants.push(spaced);

  if (withoutHash.includes("-")) variants.push(withoutHash.replace(/-/g, " "));
  if (spaced.includes(" ")) variants.push(spaced.replace(/\s+/g, "-"));

  return uniqStrings(variants);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "#YeshuaChrist";

  const normalizedQueries = expandQuery(q);

  try {
    let attempted = 0;
    let hadAnyOkResponse = false;
    let lastNonOkStatus: number | null = null;

    for (const upstream of UPSTREAMS) {
      for (const query of normalizedQueries) {
        const upstreamUrl = new URL(upstream);
        upstreamUrl.searchParams.set("q", query);
        upstreamUrl.searchParams.set("limit", "25");

        attempted++;
        const upstreamResponse = await fetch(upstreamUrl.toString(), {
          headers: { accept: "application/json" },
          next: { revalidate },
        });

        if (!upstreamResponse.ok) {
          lastNonOkStatus = upstreamResponse.status;
          continue;
        }
        hadAnyOkResponse = true;

        const data = (await upstreamResponse.json()) as { result?: { casts?: unknown[] } };
        const casts = Array.isArray(data?.result?.casts) ? data.result.casts : [];
        if (casts.length === 0) continue;

        return NextResponse.json({ casts }, { status: 200 });
      }
    }

    if (attempted > 0 && !hadAnyOkResponse) {
      return NextResponse.json(
        { error: `Upstream unavailable${lastNonOkStatus ? ` (last status: ${lastNonOkStatus})` : ""}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ casts: [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}

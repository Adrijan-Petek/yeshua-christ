import { parseYouTubeUrl, type ParsedYouTube } from "@/lib/youtube";

export type ParsedVideoUrl =
  | (ParsedYouTube & { provider: "youtube" })
  | { embedUrl: string; shareUrl: string; provider: "facebook" };

function normalizeFacebookShareUrl(url: URL): string {
  const normalized = new URL(url.toString());
  normalized.hash = "";
  normalized.search = "";
  return normalized.toString();
}

export function parseFacebookUrl(input: string): { embedUrl: string; shareUrl: string } | null {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.replace(/^www\./, "");

    const isFacebook =
      hostname === "facebook.com" ||
      hostname.endsWith(".facebook.com") ||
      hostname === "fb.watch";

    if (!isFacebook) return null;

    // Facebook embeds work best when given a clean, canonical "href" without extra params.
    const shareUrl = normalizeFacebookShareUrl(url);
    const embed = new URL("https://www.facebook.com/plugins/video.php");
    embed.searchParams.set("href", shareUrl);
    embed.searchParams.set("show_text", "0");
    embed.searchParams.set("width", "560");

    return { embedUrl: embed.toString(), shareUrl };
  } catch {
    return null;
  }
}

export function parseVideoUrl(input: string): ParsedVideoUrl | null {
  const yt = parseYouTubeUrl(input);
  if (yt) return { ...yt, provider: "youtube" };

  const fb = parseFacebookUrl(input);
  if (fb) return { ...fb, provider: "facebook" };

  return null;
}


export type ParsedYouTube = {
  embedUrl: string;
  shareUrl: string;
};

function parseTimeToSeconds(raw: string | null): number | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();

  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (/^\d+s$/.test(trimmed)) return Number(trimmed.slice(0, -1));

  const match = trimmed.match(/^((\d+)h)?((\d+)m)?((\d+)s)?$/);
  if (!match) return null;

  const hours = match[2] ? Number(match[2]) : 0;
  const minutes = match[4] ? Number(match[4]) : 0;
  const seconds = match[6] ? Number(match[6]) : 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return Number.isFinite(total) && total > 0 ? total : null;
}

function buildYouTubeEmbedUrl(videoId: string, startSeconds: number | null): string {
  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  if (startSeconds && startSeconds > 0) url.searchParams.set("start", String(startSeconds));
  return url.toString();
}

function buildYouTubeWatchUrl(videoId: string, startSeconds: number | null): string {
  const url = new URL("https://www.youtube.com/watch");
  url.searchParams.set("v", videoId);
  if (startSeconds && startSeconds > 0) url.searchParams.set("t", `${startSeconds}s`);
  return url.toString();
}

export function parseYouTubeUrl(input: string): ParsedYouTube | null {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.replace(/^www\./, "");

    const playlistId = url.searchParams.get("list");
    const videoIdFromQuery = url.searchParams.get("v");
    const startSeconds = parseTimeToSeconds(url.searchParams.get("t") ?? url.searchParams.get("start"));

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { embedUrl: buildYouTubeEmbedUrl(id, startSeconds), shareUrl: buildYouTubeWatchUrl(id, startSeconds) };
    }

    if (hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch" && videoIdFromQuery) {
        return { embedUrl: buildYouTubeEmbedUrl(videoIdFromQuery, startSeconds), shareUrl: buildYouTubeWatchUrl(videoIdFromQuery, startSeconds) };
      }

      if (url.pathname === "/playlist" && playlistId) {
        return {
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
          shareUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
        };
      }

      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/").filter(Boolean)[1];
        if (!id) return null;
        return { embedUrl: buildYouTubeEmbedUrl(id, startSeconds), shareUrl: buildYouTubeWatchUrl(id, startSeconds) };
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/").filter(Boolean)[1];
        if (!id) return null;
        const share = new URL(`https://www.youtube.com/shorts/${id}`);
        if (startSeconds && startSeconds > 0) share.searchParams.set("t", `${startSeconds}s`);
        return { embedUrl: buildYouTubeEmbedUrl(id, startSeconds), shareUrl: share.toString() };
      }

      if (playlistId) {
        return {
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
          shareUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}


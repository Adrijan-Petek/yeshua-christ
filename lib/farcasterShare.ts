import { sdk } from "@farcaster/miniapp-sdk";

export type ComposeCastOptions = {
  text?: string;
  embeds?: string[];
};

const FARCASTER_WEB_BASE = "https://farcaster.xyz";
const WARPCAST_WEB_BASE = "https://warpcast.com";

function normalizeEmbeds(embeds?: string[]) {
  const cleaned = (embeds ?? []).map((e) => e.trim()).filter(Boolean).slice(0, 2);

  if (cleaned.length === 0) return undefined;
  if (cleaned.length === 1) return [cleaned[0]] as [string];
  return [cleaned[0], cleaned[1]] as [string, string];
}

export function buildFarcasterComposeUrl(options: ComposeCastOptions): string {
  const params = new URLSearchParams();

  if (options.text) params.set("text", options.text);

  for (const embed of options.embeds ?? []) {
    const trimmed = embed.trim();
    if (!trimmed) continue;
    params.append("embeds[]", trimmed);
  }

  return `${FARCASTER_WEB_BASE}/~/compose?${params.toString()}`;
}

export function buildWarpcastComposeUrl(options: ComposeCastOptions): string {
  return buildFarcasterComposeUrl(options);
}

export function buildWarpcastFallbackComposeUrl(options: ComposeCastOptions): string {
  const params = new URLSearchParams();
  if (options.text) params.set("text", options.text);
  for (const embed of options.embeds ?? []) {
    const trimmed = embed.trim();
    if (!trimmed) continue;
    params.append("embeds[]", trimmed);
  }
  return `${WARPCAST_WEB_BASE}/~/compose?${params.toString()}`;
}

export async function tryComposeCast(options: ComposeCastOptions): Promise<boolean> {
  const embeds = normalizeEmbeds(options.embeds);

  try {
    const isMiniApp = await sdk.isInMiniApp().catch(() => false);
    if (!isMiniApp) return false;

    await sdk.actions.composeCast({
      text: options.text,
      embeds,
    });

    return true;
  } catch {
    return false;
  }
}

export async function tryAddMiniApp(): Promise<boolean> {
  try {
    const isMiniApp = await sdk.isInMiniApp().catch(() => false);
    if (!isMiniApp) return false;

    await sdk.actions.addMiniApp();
    return true;
  } catch {
    return false;
  }
}

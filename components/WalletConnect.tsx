"use client";

import { QRCode, useProfile, useSignIn } from "@farcaster/auth-kit";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { useEffect, useState } from "react";

type MiniAppUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

function normalizeMiniAppUser(input: unknown): MiniAppUser | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const fid = record.fid;
  if (typeof fid !== "number" || !Number.isFinite(fid)) return null;

  const username = typeof record.username === "string" ? record.username : undefined;
  const displayName = typeof record.displayName === "string" ? record.displayName : undefined;
  const pfpUrl = typeof record.pfpUrl === "string" ? record.pfpUrl : undefined;

  return { fid, username, displayName, pfpUrl };
}

async function fetchWarpcastUserByFid(fid: number): Promise<MiniAppUser | null> {
  try {
    const res = await fetch(`https://client.warpcast.com/v2/user?fid=${fid}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: {
        user?: {
          fid: number;
          username?: string;
          displayName?: string;
          pfp?: { url?: string };
        };
      };
    };

    const user = json?.result?.user;
    if (!user?.fid) return null;

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfp?.url,
    };
  } catch {
    return null;
  }
}

export default function WalletConnect() {
  const { isAuthenticated, profile } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [miniUser, setMiniUser] = useState<MiniAppUser | null>(null);

  const { signIn, signOut, reconnect, isPolling, isError, error, url } = useSignIn({
    onSuccess: () => setShowModal(false),
    onError: () => {
      // Keep the modal open so user can retry.
    },
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const inMiniApp = await sdk.isInMiniApp().catch(() => false);
      if (cancelled) return;

      setIsMiniApp(inMiniApp);
      if (inMiniApp) {
        const contextUser = normalizeMiniAppUser((sdk as unknown as { context?: { user?: unknown } }).context?.user);

        // Some hosts may omit optional profile fields. If username/pfp is missing,
        // fetch from public indexer using fid.
        if (contextUser?.fid && (!contextUser.username || !contextUser.pfpUrl)) {
          const enriched = await fetchWarpcastUserByFid(contextUser.fid);
          if (cancelled) return;
          setMiniUser({
            fid: contextUser.fid,
            username: contextUser.username ?? enriched?.username,
            displayName: contextUser.displayName ?? enriched?.displayName,
            pfpUrl: contextUser.pfpUrl ?? enriched?.pfpUrl,
          });
        } else {
          setMiniUser(contextUser);
        }
        setShowModal(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!mounted) return null;

  // In Farcaster Mini Apps, the user is already “connected” via host context.
  // Show them as connected and skip the QR-code flow.
  if (isMiniApp) {
    const handle = miniUser?.username;
    const fid = miniUser?.fid;
    const hasFid = typeof fid === "number" && Number.isFinite(fid);
    const label = handle
      ? `@${handle}`
      : miniUser?.displayName
        ? miniUser.displayName
        : hasFid
          ? `FID ${fid}`
          : "Farcaster";
    const pfpSrc = miniUser?.pfpUrl ?? "/icons/icon-150x150.png";

    return (
      <div className="flex items-center gap-2">
        <Image src={pfpSrc} alt={label} width={32} height={32} className="w-8 h-8 rounded-full" unoptimized />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  }

  if (isAuthenticated && profile) {
    const username = profile.username ?? profile.displayName ?? "Farcaster";
    const pfpSrc = profile.pfpUrl ?? "/icons/icon-150x150.png";

    return (
      <div className="flex items-center gap-2">
        <Image
          src={pfpSrc}
          alt={username}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
          unoptimized
        />
        <span className="text-sm font-medium">@{username}</span>

        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowModal(true);
          signIn();
        }}
        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-800"
      >
        Connect Farcaster
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur">
          <div className="flex min-h-[100vh] w-full items-center justify-center p-4 supports-[height:100dvh]:min-h-[100dvh]">
            <div className="w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-800 dark:bg-stone-950 supports-[height:100dvh]:max-h-[calc(100dvh-2rem)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-950 dark:text-amber-300">Connect to Farcaster</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  ✕
                </button>
              </div>

              {!url && (
                <div className="space-y-3">
                  <p className="text-sm text-stone-700 dark:text-stone-300">Preparing sign-in…</p>
                  <button
                    type="button"
                    onClick={signIn}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                  >
                    Start again
                  </button>
                </div>
              )}

              {url && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-black">
                      <QRCode uri={url} />
                    </div>
                  </div>

                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                  >
                    Open in Warpcast
                  </a>

                  {isPolling && (
                    <p className="text-center text-xs text-stone-600 dark:text-stone-400">Waiting for approval…</p>
                  )}

                  {isError && (
                    <div className="space-y-2">
                      <p className="text-xs text-red-700 dark:text-red-400">
                        {error?.message ?? "Could not connect. Please try again."}
                      </p>
                      <button
                        type="button"
                        onClick={reconnect}
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-black dark:hover:bg-stone-900"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
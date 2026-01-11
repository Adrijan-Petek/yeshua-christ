"use client";

import { SignInButton, useProfile } from "@farcaster/auth-kit";
import { useEffect, useState } from "react";

export default function WalletConnect() {
  const { isAuthenticated, profile } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (isAuthenticated && profile) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={profile.pfpUrl}
          alt={profile.displayName}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm">{profile.displayName}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
      >
        Connect Wallet
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-black">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Connect to Farcaster</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <SignInButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
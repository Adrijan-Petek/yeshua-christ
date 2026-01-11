"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AdminPanel from "./AdminPanel";
import ThemeToggle from "./ThemeToggle";
import WalletConnect from "./WalletConnect";

const LOGO_SRC = "/logo/yeshua-christ.png";

export default function Navbar() {
  const [clickCount, setClickCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 10) {
      setShowAdmin(true);
      setClickCount(0); // reset
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200 bg-stone-50/80 backdrop-blur dark:border-stone-700 dark:bg-black/80">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3">
            <Image
              src={LOGO_SRC}
              alt="Yeshua-Christ"
              width={140}
              height={80}
              priority
              className="rounded-full"
            />
          </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 text-sm">
          <Link
            href="/"
            className="rounded-lg px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Home
          </Link>
          <Link
            href="/faith"
            className="rounded-lg px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Faith
          </Link>
          <Link
            href="/videos"
            className="rounded-lg px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Videos
          </Link>
          <Link
            href="/bible"
            className="rounded-lg px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Bible
          </Link>

          <div className="ml-1">
            <ThemeToggle />
          </div>
          <div className="ml-1">
            <WalletConnect />
          </div>
        </nav>
      </div>
    </header>

    {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
  </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AdminPanel from "./AdminPanel";
import ThemeToggle from "./ThemeToggle";
import WalletConnect from "./WalletConnect";

const LOGO_SRC = "/logo/yeshua-christ-header.png";

export default function Navbar() {
  const [clickCount, setClickCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 10) {
      setShowAdmin(true);
      setClickCount(0); // reset
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur dark:border-stone-800 dark:bg-black/70">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-3 px-4">
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3">
            <Image
              src={LOGO_SRC}
              alt="Yeshua-Christ"
              width={260}
              height={64}
              priority
              className="h-11 w-auto sm:h-[3.6rem]"
            />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletConnect />
          </div>
      </div>
    </header>

    {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
  </>
  );
}

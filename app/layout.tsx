import type { Metadata } from "next";
import { Lora } from "next/font/google";
import BodyContent from "./body-content";
import Navbar from "../components/Navbar";
import Providers from "./providers";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yeshua-Christ",
  description: "Spread the Gospel freely",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lora.className} min-h-dvh bg-white text-stone-950 antialiased dark:bg-gradient-to-b dark:from-black dark:via-black dark:to-stone-950 dark:text-stone-100`}
      >
        <BodyContent>
          <Providers>
            <Navbar />
            <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-20">{children}</main>
          </Providers>
        </BodyContent>
      </body>
    </html>
  );
}

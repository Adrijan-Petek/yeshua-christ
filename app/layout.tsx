import type { Metadata } from "next";
import { Lora } from "next/font/google";
import BodyContent from "./body-content";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Providers from "./providers";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yeshua-Christ",
  description: "Spread the Gospel freely",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://yeshua-christ.vercel.app/og",
      button: {
        title: "Open App",
        action: {
          type: "launch_miniapp",
          name: "Yeshua-Christ",
          url: "https://yeshua-christ.vercel.app/",
        },
      },
    }),
    // Backward compatibility for clients still reading legacy tag
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://yeshua-christ.vercel.app/og",
      button: {
        title: "Open App",
        action: {
          type: "launch_frame",
          name: "Yeshua-Christ",
          url: "https://yeshua-christ.vercel.app/",
        },
      },
    }),
  },
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
            <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-20">
              <SubNav />
              <main className="pt-6">{children}</main>
            </div>
          </Providers>
        </BodyContent>
      </body>
    </html>
  );
}

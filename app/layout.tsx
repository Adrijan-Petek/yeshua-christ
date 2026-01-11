import type { Metadata } from "next";
import { Lora } from "next/font/google";
import ClientLayout from "./client-layout";
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
        className={`${lora.className} bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-100 antialiased`}
      >
        <ClientLayout>
          <Providers>
            <Navbar />
            <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-20">{children}</main>
          </Providers>
        </ClientLayout>
      </body>
    </html>
  );
}

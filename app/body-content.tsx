"use client";

import { ThemeProvider } from "next-themes";

export default function BodyContent({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
}
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Script from "next/script";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Advance & Production Tracking System",
  description: "Track employee advances, wages, deductions, and dynamic balances in real time."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get("sidebar")?.value === "collapsed";

  return (
    <html lang="en" suppressHydrationWarning>
      <body data-sidebar={collapsed ? "collapsed" : "expanded"}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var savedTheme = window.localStorage.getItem("theme");
                var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                var isDark = savedTheme ? savedTheme === "dark" : prefersDark;
                document.documentElement.classList.toggle("dark", isDark);
              } catch (e) {}
            })();
          `}
        </Script>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

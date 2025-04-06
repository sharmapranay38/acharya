"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import dynamic from 'next/dynamic';

// Conditionally import ClerkProvider
const ClerkProvider = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? dynamic(() => import('@clerk/nextjs').then((mod) => mod.ClerkProvider))
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if Clerk is configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    {isClerkConfigured ? <ClerkProvider> : <></>}
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    {isClerkConfigured ? </ClerkProvider> : <></>}
  );
}

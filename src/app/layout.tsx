import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthGate } from "@/components/auth/AuthGate";
import { UserProvider } from "@/components/layout/UserContext";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SWRConfig } from 'swr'
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "▲ vercel/Feedback",
  description: "the home for gtm & product idea sharing and accountability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <SWRConfig
            value={{
              // Optimized for instant navigation
              dedupingInterval: 300000, // 5 minutes
              revalidateOnFocus: false, // Don't refetch when tabbing back
              revalidateOnReconnect: true,
              revalidateIfStale: false, // Use cached data for instant loading
              errorRetryCount: 3,
              errorRetryInterval: 1000,
              // Use stale data while revalidating for instant perceived performance
              keepPreviousData: true,
              // Enable background updates
              refreshInterval: 0, // Disable automatic refresh
            }}
          >
            <UserProvider>
              <AuthGate>
                {children}
                <CommandPalette />
              </AuthGate>
            </UserProvider>
          </SWRConfig>
        </NuqsAdapter>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

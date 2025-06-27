import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthGate } from "@/components/auth/AuthGate";
import { UserProvider } from "@/components/layout/UserContext";
import { SWRConfig } from 'swr'

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
              // Global SWR configuration
              dedupingInterval: 300000, // 5 minutes
              revalidateOnFocus: true,
              revalidateOnReconnect: true,
              errorRetryCount: 3,
              errorRetryInterval: 1000,
            }}
          >
            <UserProvider>
              <AuthGate>
                {children}
              </AuthGate>
            </UserProvider>
          </SWRConfig>
        </NuqsAdapter>
      </body>
    </html>
  );
}

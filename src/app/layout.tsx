import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthGate } from "@/components/auth/AuthGate";
import { UserProvider } from "@/components/layout/UserContext";

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
    <html lang="en" className="antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <NuqsAdapter>
          <UserProvider>
            <AuthGate>
              {children}
            </AuthGate>
          </UserProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}

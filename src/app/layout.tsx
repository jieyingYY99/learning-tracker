import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learning Tracker | \u5b66\u4e60\u8ffd\u8e2a\u5668",
  description:
    "Track your weekly learning progress with spaced repetition review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Nav />
        <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}

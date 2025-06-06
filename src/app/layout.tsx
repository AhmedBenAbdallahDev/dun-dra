import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add medieval fonts - Note: Next.js doesn't have MedievalSharp, so we'll use alternatives
// We'll add these via Google Fonts link in the head instead

export const metadata: Metadata = {
  title: "Mythic Conjurer",
  description: "An AI-powered RPG adventure game",
  other: {
    'font-link': 'https://fonts.googleapis.com/css2?family=MedievalSharp&family=Signika+Negative:wght@300;400;500&display=swap'
  }
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}

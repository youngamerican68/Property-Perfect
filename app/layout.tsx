import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CreditProvider } from "./context/CreditContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropertyPerfect - AI-Powered Real Estate Photo Enhancement",
  description: "Transform your property photos with AI. Remove clutter, add virtual staging, and enhance images in seconds.",
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
        <CreditProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </CreditProvider>
      </body>
    </html>
  );
}

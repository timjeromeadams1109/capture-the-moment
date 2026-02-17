import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Capture The Moment Photo Booths | Premium Photo Booth Rentals in SoCal",
    template: "%s | Capture The Moment Photo Booths",
  },
  description:
    "Premium photo booth experiences for corporate events and upscale celebrations throughout Southern California. Stand-alone photo booths and 360 booth experiences.",
  keywords: [
    "photo booth rental",
    "360 photo booth",
    "Orange County photo booth",
    "Los Angeles photo booth",
    "corporate event photo booth",
    "wedding photo booth",
    "Southern California events",
  ],
  authors: [{ name: "Capture The Moment Photo Booths" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://capturethemomentphotobooths.com",
    siteName: "Capture The Moment Photo Booths",
    title: "Premium Photo Booth Rentals in Southern California",
    description:
      "Premium photo booth experiences for corporate events and upscale celebrations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

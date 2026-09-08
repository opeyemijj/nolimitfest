import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "No Limit Fest Dubai 2026 | Music, Energy, No limit | Ruger Live",
    template: "%s | No Limit Fest",
  },
  description:
    "No Limit Fest — Music, Energy, No limit. Dubai 2026 starring global Afrobeats superstar RUGER live at Helipad by Frozen Cherry on Saturday 24th October 2026 (6:00 PM Till Late). Organized by Shurlaybor Empire and Typical Naija. Reserve Individual Passes, VIP Table for 6, Table for 8, or Table for 10 via instant WhatsApp EOI.",
  keywords: [
    "No Limit Fest",
    "No Limit Fest Dubai",
    "No Limit Fest Dubai 2026",
    "Ruger in Dubai",
    "Ruger live concert Dubai 2026",
    "Helipad by Frozen Cherry Dubai",
    "Helipad by Frozen Cherry festival",
    "Dubai music festival October 2026",
    "Afrobeats festival Dubai",
    "Amapiano music festival UAE",
    "VIP table bookings Dubai events",
    "VIP Table for 6 Dubai",
    "VIP Table for 8 Dubai",
    "VIP Table for 10 Dubai",
    "Shurlaybor Empire",
    "Typical Naija",
    "Dubai luxury festival nightlife",
    "GCC music tour waitlist",
    "Doha music festival 2027",
    "Riyadh music festival waitlist",
    "Bahrain music festival",
    "Oman music festival",
    "Dubai Helipad concerts",
  ],
  authors: [
    { name: "No Limit Fest", url: siteConfig.url },
    { name: "Shurlaybor Empire" },
    { name: "Typical Naija" },
  ],
  creator: "Shurlaybor Empire & Typical Naija",
  publisher: "No Limit Fest Worldwide",
  alternates: {
    canonical: siteConfig.url,
  },
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "No Limit Fest Dubai 2026 | Ruger Live at Helipad by Frozen Cherry",
    description:
      "Saturday 24th October 2026 (6PM Till Late). Global Afrobeats superstar Ruger live at Helipad by Frozen Cherry, Dubai. Reserve Individual Passes and VIP Table packages (Table for 6, 8, 10) now.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "No Limit Fest Dubai 2026 - Ruger Live at Helipad by Frozen Cherry",
      },
      {
        url: "/images/logo.png",
        width: 1024,
        height: 1024,
        alt: "No Limit Fest Official Graffiti Logo",
      },
    ],
    locale: "en_AE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "No Limit Fest Dubai 2026 | Ruger Live at Helipad",
    description:
      "Saturday 24th October 2026. Ruger live at Helipad by Frozen Cherry, Dubai. Register Expression of Interest on WhatsApp!",
    images: ["/images/og-image.png"],
    creator: "@nolimitfest",
    site: "@nolimitfest",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "geo.region": "AE-DU",
    "geo.placename": "Dubai, United Arab Emirates",
    "geo.position": "25.2048;55.2708",
    "ICBM": "25.2048, 55.2708",
    "event:start_time": "2026-10-24T18:00:00+04:00",
    "event:end_time": "2026-10-25T04:00:00+04:00",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen bg-[#08090E] text-[#F3F4F6] antialiased flex flex-col selection:bg-[#FF5722] selection:text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

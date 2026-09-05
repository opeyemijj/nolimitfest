import { Metadata } from "next";
import { Globe, Sparkles } from "lucide-react";
import { festivalEvents } from "@/data/events";
import EventCardWithEOI from "@/components/events/EventCardWithEOI";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Global Tour Stops & Waitlist (Dubai, GCC & Worldwide) | No Limit Fest",
  description:
    "Explore all official editions and waitlists of No Limit Fest: Dubai (Oct 2026), Doha, Oman, Bahrain, Saudi Arabia, London, Miami, Lagos, and Tokyo. Select Individual Passes, Table for 6, Table for 8, or Table for 10 and register your Expression of Interest.",
  keywords: [
    "No Limit Fest World Tour",
    "Dubai music festival",
    "Doha festival waitlist",
    "Oman festival waitlist",
    "Bahrain festival waitlist",
    "Saudi Arabia festival waitlist",
    "London Afrobeats festival",
    "Miami urban festival",
    "Lagos homecoming festival",
    "Tokyo music fest",
  ],
  alternates: {
    canonical: `${siteConfig.url}/events`,
  },
  openGraph: {
    title: "No Limit Fest Global Tour | Dubai 2026 & GCC Waitlist",
    description: "Multi-city festival tour spanning Dubai, Doha, Muscat, Manama, Riyadh, London, Miami, Lagos, and Tokyo. Register EOI on WhatsApp.",
    url: `${siteConfig.url}/events`,
    images: ["/images/logo.png"],
  },
};

export default function EventsPage() {
  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      {/* Hero */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-black uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            <span>Worldwide Festival Circuit</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">TOUR EDITIONS</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Every No Limit Fest city edition features world-class stages, international artists, and tiered passes for individuals and private tables (Table for 6, Table for 8, Table for 10). Fill the EOI form under any event to connect directly on WhatsApp.
          </p>
        </div>
      </div>

      {/* Events List - Each with 4 pass types and EOI form under it */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {festivalEvents.map((evt, index) => (
          <EventCardWithEOI 
            key={evt.id} 
            event={evt} 
            isInitialExpanded={index === 0} 
          />
        ))}
      </div>
    </div>
  );
}

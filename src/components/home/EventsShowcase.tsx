"use client";

import { useState } from "react";
import { Globe, Sparkles } from "lucide-react";
import { DbEvent, DbTicketTier } from "@/lib/data-service";
import TicketPurchaseWidget from "@/components/tickets/TicketPurchaseWidget";

interface EventsShowcaseProps {
  events: DbEvent[];
  initialTiers: Record<string, DbTicketTier[]>;
}

export default function EventsShowcase({
  events,
  initialTiers,
}: EventsShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string>("dubai");

  const currentSelectedEvent =
    events.find((e) => e.slug === activeTab) || events[0];
  const currentTiers = initialTiers[currentSelectedEvent.id] || [];

  return (
    <section
      id="tickets"
      className="py-12 xs:py-16 sm:py-24 px-3 xs:px-4 sm:px-6 lg:px-8 bg-[#090B12] relative overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#FF5722]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 sm:space-y-12">
        {/* Heading */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-[11px] sm:text-xs font-black uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            <span>Official Festival Store</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            FESTIVAL EDITIONS &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">
              TICKET SALES
            </span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-base px-2 sm:px-0 leading-relaxed">
            Select a city below to view passes, squad packs, and VIP table
            hospitality. Instant digital tickets with secure QR codes delivered
            via email.
          </p>
        </div>

        {/* City Filter Navigation Pills - Touch Smooth Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 justify-start sm:justify-center no-scrollbar">
          {events.map((evt) => (
            <button
              key={evt.id}
              onClick={() => setActiveTab(evt.slug)}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                activeTab === evt.slug
                  ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base sm:text-lg">{evt.flag}</span>
              <span>{evt.city}</span>
              {evt.isCurrentEdition ? (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/40 text-[9px] text-[#00E5FF] border border-[#00E5FF]/30">
                  FLAGSHIP
                </span>
              ) : evt.status === "waitlist" ? (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FFD600]/20 text-[9px] text-[#FFD600] border border-[#FFD600]/40">
                  WAITLIST
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Selected Event Ticket Store Widget */}
        <div className="space-y-8">
          <TicketPurchaseWidget
            event={currentSelectedEvent}
            tiers={currentTiers}
          />
        </div>
      </div>
    </section>
  );
}

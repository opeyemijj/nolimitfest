"use client";

import { useState } from "react";
import { Globe, Sparkles } from "lucide-react";
import { festivalEvents } from "@/data/events";
import EventCardWithEOI from "@/components/events/EventCardWithEOI";

export default function EventsShowcase() {
  const [activeTab, setActiveTab] = useState<string>("dubai");

  return (
    <section id="events" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#090B12] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#FF5722]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-black uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            <span>Multi-City Global Editions</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            FESTIVAL EDITIONS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">EOI REGISTRATION</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Select an event edition below to view its venue specs, lineup, and passes (Individual Pass, Table for 6, Table for 8, Table for 10), then submit your Expression of Interest directly via WhatsApp.
          </p>
        </div>

        {/* City Filter Navigation Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {festivalEvents.map((evt) => (
            <button
              key={evt.id}
              onClick={() => setActiveTab(evt.slug)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === evt.slug
                  ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/25 scale-105"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base sm:text-lg">{evt.flag}</span>
              <span>{evt.city}</span>
              {evt.isCurrentEdition ? (
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px] text-[#00E5FF] border border-[#00E5FF]/30">
                  FLAGSHIP
                </span>
              ) : evt.status === "waitlist" ? (
                <span className="px-2 py-0.5 rounded-full bg-[#FFD600]/20 text-[9px] text-[#FFD600] border border-[#FFD600]/40">
                  WAITLIST
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Selected Event Card with Full Passes and Embedded EOI */}
        <div className="space-y-8">
          {festivalEvents
            .filter((evt) => evt.slug === activeTab)
            .map((evt) => (
              <EventCardWithEOI key={evt.id} event={evt} isInitialExpanded={true} />
            ))}
        </div>
      </div>
    </section>
  );
}

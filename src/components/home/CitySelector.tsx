"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, ArrowUpRight, Sparkles, MapPin, Compass } from "lucide-react";
import { festivalEvents } from "@/data/events";

export default function CitySelector() {
  const [regionFilter, setRegionFilter] = useState<"all" | "Middle East / GCC" | "International">("all");

  const filteredEvents = festivalEvents.filter((event) => {
    if (regionFilter === "all") return true;
    return event.region === regionFilter;
  });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#08090E] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#FFD600]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>World Tour Itinerary</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              FROM DUBAI TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] to-[#FFD600]">THE WORLD</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-2xl">
              The premier 1st Edition launches in Dubai, followed by our official GCC tour waitlist (<span className="text-white font-semibold">Doha, Oman, Bahrain, Saudi Arabia</span>) and global tour stops worldwide.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold transition-all hover:scale-105 self-start md:self-auto"
          >
            <span>View All Tour Stops</span>
            <ArrowUpRight className="w-4 h-4 text-[#FF5722]" />
          </Link>
        </div>

        {/* Region Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2">
          <button
            onClick={() => setRegionFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              regionFilter === "all"
                ? "bg-white text-black shadow-lg"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            All Tour Stops ({festivalEvents.length})
          </button>

          <button
            onClick={() => setRegionFilter("Middle East / GCC")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              regionFilter === "Middle East / GCC"
                ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/20"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🔥 Middle East & GCC (5)</span>
          </button>

          <button
            onClick={() => setRegionFilter("International")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              regionFilter === "International"
                ? "bg-[#00E5FF] text-black shadow-lg shadow-cyan-500/20"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>International Circuit (4)</span>
          </button>
        </div>

        {/* Global Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isWaitlist = event.status === "waitlist";

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 ${
                  event.isCurrentEdition
                    ? "border-[#FF5722]/60 shadow-2xl shadow-orange-500/15 ring-1 ring-[#FF5722]/30"
                    : isWaitlist
                    ? "border-[#FFD600]/30 hover:border-[#FFD600]/60 hover:shadow-xl hover:shadow-[#FFD600]/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                {/* Background Image */}
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={event.heroImage}
                    alt={`${event.name} ${event.city}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F121C] via-[#0F121C]/60 to-transparent" />

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-2xl drop-shadow-md">{event.flag}</span>
                    {event.isCurrentEdition ? (
                      <span className="px-3 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                        1st Edition • Live EOI
                      </span>
                    ) : isWaitlist ? (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD600] to-[#FF5722] text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                        GCC Tour • Waitlist Open
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                        Announced
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 bg-[#0F121C] relative">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider">
                      {event.edition}
                    </p>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      {event.region}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-[#FF5722] transition-colors">
                    {event.city}, {event.country}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300">{event.dates}</span>
                    <span className="text-[#FFD600] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>
                        {event.isCurrentEdition
                          ? "Register EOI"
                          : isWaitlist
                          ? "Join GCC Waitlist"
                          : "Explore Edition"}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

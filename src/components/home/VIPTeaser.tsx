"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Crown, 
  Check, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  User, 
  Users, 
  Ticket, 
  Flame, 
  Zap,
  Clock
} from "lucide-react";
import { getActiveEvent, dubaiTicketPhases, dubaiGroupPackages } from "@/data/events";
import { siteConfig } from "@/config/site";

export default function VIPTeaser() {
  const currentEvent = getActiveEvent();
  const [filter, setFilter] = useState<"all" | "phases" | "groups" | "vip">("all");

  const cleanPhone = siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "");

  return (
    <section id="tickets" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#08090E] relative overflow-hidden">
      {/* Anchor for #vip as well */}
      <div id="vip" className="scroll-mt-24" />

      {/* Background accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[#FF5722]/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-14">
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-xs font-black uppercase tracking-widest">
            <Ticket className="w-3.5 h-3.5" />
            <span>Official Tickets &amp; VIP Hospitality</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            FESTIVAL TICKETS &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD600] via-[#FF5722] to-[#00E5FF]">PASS PACKAGES</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Witness Afrobeats superstar <strong className="text-white">RUGER</strong> live at Helipad by Frozen Cherry, Dubai. Early Bird allocations are strictly limited — reserve your tickets or VIP table before prices increase.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/25"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Passes &amp; Packages
            </button>
            <button
              onClick={() => setFilter("phases")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                filter === "phases"
                  ? "bg-[#FF5722] text-white shadow-lg shadow-orange-500/25"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Zap className="w-3 h-3 text-[#FFD600]" />
              Individual Phases (From AED 129)
            </button>
            <button
              onClick={() => setFilter("groups")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                filter === "groups"
                  ? "bg-[#00E5FF] text-black font-black shadow-lg shadow-cyan-500/25"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="w-3 h-3" />
              Squad Deals (3 &amp; 4 Pax)
            </button>
            <button
              onClick={() => setFilter("vip")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                filter === "vip"
                  ? "bg-[#FFD600] text-black font-black shadow-lg shadow-yellow-500/25"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Crown className="w-3 h-3" />
              VIP Tables (6, 8, 10 Guests)
            </button>
          </div>
        </div>

        {/* 1. INDIVIDUAL TICKET PHASES TIMELINE CARD */}
        {(filter === "all" || filter === "phases") && (
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#141724] to-[#0E101A] border border-white/15 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-[11px] font-black uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
                  <span>Early Bird Release Is Live</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  INDIVIDUAL TICKET PHASES &amp; DOOR PRICING
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Ticket prices increase progressively as each tier sells out. Lock in your entry at the guaranteed lowest rate now.
                </p>
              </div>

              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  "Hello! I want to secure my Early Bird Ticket (AED 129) for No Limit Fest Dubai starring Ruger."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start md:self-auto px-5 py-3 rounded-xl bg-[#00E676] hover:bg-[#00E676]/90 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buy Early Bird (AED 129)</span>
              </a>
            </div>

            {/* 5 Phases Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {dubaiTicketPhases.map((tier) => {
                const isEarlyBird = tier.id === "early-bird";
                const isDoor = tier.id === "door";

                return (
                  <div
                    key={tier.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between relative transition-all duration-300 ${
                      isEarlyBird
                        ? "bg-gradient-to-b from-[#1C2338] to-[#121626] border-[#00E676] shadow-xl shadow-emerald-500/15 ring-2 ring-[#00E676]/30 scale-[1.02]"
                        : isDoor
                        ? "bg-[#10121D] border-white/10 opacity-90"
                        : "bg-[#10121D] border-white/10 hover:border-white/20"
                    }`}
                  >
                    {isEarlyBird && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00E676] text-black text-[9px] font-black uppercase tracking-widest shadow-md whitespace-nowrap animate-pulse">
                        ★ LIVE NOW ★
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                          {tier.phase}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isEarlyBird
                              ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40"
                              : isDoor
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {tier.status === "active" ? "On Sale" : tier.status === "door" ? "Door Price" : "Upcoming"}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-white mb-1">
                        {tier.name}
                      </h4>

                      <div className="my-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#FFD600] font-mono">
                          AED {tier.price}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10">
                      {isEarlyBird ? (
                        <a
                          href={`#event-${currentEvent.slug}`}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] hover:from-[#ff6a3c] hover:to-[#ffe033] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                        >
                          <span>Get Ticket</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Hello! Please alert me when ${tier.name} (AED ${tier.price}) opens for No Limit Fest Dubai.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{isDoor ? "Gate Info" : "Waitlist"}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. GROUP SQUAD PASSES (3 PAX & 4 PAX) */}
        {(filter === "all" || filter === "groups") && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-[11px] font-black uppercase tracking-wider mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Squad &amp; Group Bundles</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  GROUP PASS PACKAGES — PARTY TOGETHER &amp; SAVE
                </h3>
              </div>
              <span className="text-xs text-[#00E5FF] font-bold">
                ⚡ Save up to AED 500 compared to Event Door rates
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dubaiGroupPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                    pkg.popular
                      ? "bg-gradient-to-b from-[#1A2038] to-[#101426] border-2 border-[#00E5FF] shadow-2xl shadow-cyan-500/20"
                      : "bg-[#111422] border border-white/15 hover:border-white/30"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#FFD600] text-black text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                      ★ BEST SQUAD VALUE ★
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00E5FF] mb-1">
                          <Users className="w-4 h-4" />
                          <span>{pkg.badge}</span>
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black text-white">{pkg.name}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-[#FFD600] font-mono block">
                          {pkg.formattedPrice}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          ~AED {pkg.pricePerPerson} / person
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pkg.savings}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                        Included in this pass:
                      </span>
                      {pkg.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span className="leading-snug text-[11px]">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-6 mt-6 border-t border-white/10">
                    <a
                      href={`#event-${currentEvent.slug}`}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 hover:scale-[1.02] transition-all"
                    >
                      <span>Select {pkg.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hello! I want to inquire about booking the ${pkg.name} (${pkg.formattedPrice}) for No Limit Fest Dubai.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/25 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Reservation</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. VIP TABLE PACKAGES (6, 8, 10 GUESTS) */}
        {(filter === "all" || filter === "vip") && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-[11px] font-black uppercase tracking-widest mb-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Ultra-Luxury Table Hospitality</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  VIP TABLES &amp; VVIP CABANAS (HELIPAD DECK)
                </h3>
              </div>

              <Link
                href="/vip"
                className="self-start sm:self-auto text-xs font-bold text-[#FFD600] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View Full VIP Table Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {currentEvent.ticketTiers
                .filter((tier) => tier.name.includes("Table"))
                .map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300 ${
                      tier.popular
                        ? "bg-gradient-to-b from-[#1E2336] to-[#121524] border-2 border-[#FFD600] shadow-2xl shadow-yellow-500/15 scale-100 lg:-translate-y-2"
                        : "bg-[#11131E] border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD600] to-[#FF5722] text-black text-[9px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                        {tier.badge}
                      </div>
                    )}

                    <div>
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#FFD600] font-black uppercase tracking-wider mb-1">
                          <Crown className="w-3.5 h-3.5" />
                          <span>{tier.capacityLabel}</span>
                        </div>
                        <h4 className="text-xl font-black text-white">{tier.name}</h4>
                        <p className="text-xl sm:text-2xl font-black text-[#FFD600] mt-2 font-mono">
                          {tier.priceEstimate}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Includes beverage credit &amp; dedicated hostess</p>
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-white/10 mb-6">
                        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                          VIP Privileges:
                        </span>
                        {tier.perks.map((perk) => (
                          <div key={perk} className="flex items-start gap-2 text-xs text-gray-300">
                            <div className="w-4 h-4 rounded-full bg-[#FFD600]/20 text-[#FFD600] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className="leading-snug text-[11px]">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <a
                        href={`#event-${currentEvent.slug}`}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          tier.popular
                            ? "bg-gradient-to-r from-[#FFD600] to-[#FF5722] text-black shadow-lg shadow-yellow-500/25 hover:scale-[1.02]"
                            : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                        }`}
                      >
                        <span>Select {tier.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hello! I would like to inquire about reserving ${tier.name} for No Limit Fest Dubai at Helipad by Frozen Cherry.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp VIP Concierge</span>
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


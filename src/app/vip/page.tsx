import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  Crown, 
  Check, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  Wine, 
  Anchor, 
  User,
  Users,
  ArrowRight
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { getActiveEvent } from "@/data/events";
import EventCardWithEOI from "@/components/events/EventCardWithEOI";

export const metadata: Metadata = {
  title: "VIP Tables & Cabanas (From AED 2,000 to VVIP DJ Deck) | No Limit Fest Dubai 2026",
  description:
    "Official tickets & ultra-luxury VIP table bookings at Helipad by Frozen Cherry for No Limit Fest Dubai 2026. 4 Pax Standing Table (AED 2,000), 5 Pax (AED 4,000), 8 Pax (AED 6,000), 10 Pax (AED 8,000), and VVIP Zone Back of DJ (AED 10,000).",
  keywords: [
    "VIP table booking Dubai",
    "Helipad by Frozen Cherry VIP tables",
    "4 pax standing table Dubai",
    "5 pax VIP table Dubai",
    "8 pax VIP table Dubai",
    "10 pax VIP cabana Dubai",
    "VVIP DJ deck Dubai festival",
    "Dubai nightlife VIP packages",
    "No Limit Fest VIP reservations",
    "No Limit Fest tickets Dubai",
  ],
  alternates: {
    canonical: `${siteConfig.url}/vip`,
  },
  openGraph: {
    title: "VIP Tables & Cabanas | No Limit Fest Dubai 2026",
    description: "Reserve your 4 Pax Standing Table (AED 2,000), VIP Table for 5, 8, 10, or VVIP Zone Back of DJ (AED 10,000) at Helipad by Frozen Cherry.",
    url: `${siteConfig.url}/vip`,
    images: ["/images/logo.png"],
  },
};

export default function VIPPage() {
  const currentEvent = getActiveEvent();

  const vipTiers = [
    {
      title: "Individual Pass",
      tier: "Individual (1 Guest)",
      price: "Early Bird AED 129",
      badge: "From AED 129",
      icon: User,
      desc: "Single admission to Helipad festival grounds. Tier phases: Early Bird AED 129, Phase 1 AED 150, Phase 2 AED 175, Phase 3 AED 200, Event Door AED 250.",
      features: [
        "Access to Helipad by Frozen Cherry festival grounds",
        "Live headline concert by RUGER and supporting guest acts",
        "Access to sunset cocktail bars and street food village",
        "Official commemorative wristband & express entry",
      ],
    },
    {
      title: "Group Squad Passes",
      tier: "Squad Deal (3 & 4 Guests)",
      price: "3 Pax AED 400 | 4 Pax AED 500",
      badge: "Save Up To AED 500",
      icon: Users,
      desc: "Party together with friends. Group of 3 for AED 400 (~AED 133/person) or Group of 4 for AED 500 (only AED 125/person — best value!).",
      features: [
        "Bundled festival admission passes for 3 or 4 guests",
        "Save up to AED 500 compared to individual event door rates",
        "Live headline concert by RUGER and guest performers",
        "Expedited group check-in and wristband collection",
      ],
    },
    {
      title: "4 Pax Standing Table",
      tier: "High Standing Table (4 Guests)",
      price: "AED 2,000",
      badge: "Standing Table",
      icon: Crown,
      desc: "Reserved high standing table on the festival perimeter with fast-track entry and beverage credit for 4 guests.",
      features: [
        "Reserved high standing table for up to 4 guests",
        "Fast-track expedited entry queue at Helipad",
        "Includes beverage bottle service credit",
        "Dedicated table server and cocktail service",
      ],
    },
    {
      title: "VIP Table for 5",
      tier: "VIP Lounge Table (5 Guests)",
      price: "AED 4,000",
      badge: "VIP Lounge",
      icon: Crown,
      desc: "Reserved VIP lounge seating table for up to 5 guests with elevated stage views and bottle service allocation.",
      features: [
        "Reserved VIP Lounge seating for up to 5 guests",
        "Fast-track VIP entry queue at Helipad",
        "Premium bottle service and beverage credit package",
        "Dedicated table hostess and VIP restroom access",
      ],
    },
    {
      title: "VIP Table for 8",
      tier: "Prime VIP Table (8 Guests)",
      price: "AED 6,000",
      badge: "Most Popular VIP",
      popular: true,
      icon: Crown,
      desc: "Prime center-tier VIP table for up to 8 guests with direct unobstructed panoramic stage views of Ruger.",
      features: [
        "Prime elevated VIP table for up to 8 guests",
        "Direct unobstructed panoramic mainstage sightlines",
        "Top-shelf spirits & vintage bottle service credit",
        "Chef finger-food platters & dedicated table hostess",
      ],
    },
    {
      title: "VIP Table for 10",
      tier: "VIP Deck Table (10 Guests)",
      price: "AED 8,000",
      badge: "VIP Deck",
      icon: Crown,
      desc: "Spacious elevated VIP deck table for up to 10 guests with luxury hospitality, bottle service, and valet privileges.",
      features: [
        "Spacious elevated VIP deck table for up to 10 guests",
        "Expedited VIP entrance & complimentary valet parking",
        "Luxury bottle service and champagne allocation",
        "Dedicated table hostesses & security escort",
      ],
    },
    {
      title: "VVIP Zone - Back of DJ (10 pax)",
      tier: "Ultra VVIP Deck (10 Guests)",
      price: "AED 10,000",
      badge: "★ Ultra VVIP DJ Booth ★",
      popular: true,
      icon: Crown,
      desc: "The ultimate insider experience: private center-stage VVIP enclosure positioned directly behind the DJ booth with unrivaled artist proximity.",
      features: [
        "Exclusive VVIP Cabana positioned directly behind the DJ booth",
        "Direct proximity to Ruger, headlining DJs & stage action",
        "Dedicated personal butler & private security detail",
        "Premium vintage champagne and top-shelf bottle package",
        "Complimentary VIP valet parking for 3 vehicles",
      ],
    },
  ];

  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      {/* Hero */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#FFD600]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-xs font-black uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5" />
            <span>Dubai Ultra-Luxury Protocol</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            INDIVIDUAL PASSES &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD600] via-[#FF5722] to-[#FF007F]">TABLE CABANAS</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Redefining festival hospitality on the Dubai waterfront. Select from Individual Passes, Squad Bundles, or private VIP tables from 4 to 10 guests and the exclusive VVIP Zone behind the DJ booth.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Wine className="w-4 h-4 text-[#FFD600]" /> Premium Bottle Service
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Anchor className="w-4 h-4 text-[#00E5FF]" /> Private Yacht Marina Docking
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dedicated 24/7 Concierge
            </span>
          </div>
        </div>
      </div>

      {/* 4 Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {vipTiers.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.title}
                className={`rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                  pkg.popular
                    ? "bg-gradient-to-b from-[#1C2032] to-[#121422] border-2 border-[#FF5722] shadow-2xl shadow-orange-500/20 scale-100 lg:-translate-y-2"
                    : "bg-[#11131E] border border-white/10 hover:border-white/20"
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white text-[9px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    {pkg.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00E5FF] mb-1">
                    <Icon className="w-4 h-4" />
                    <span>{pkg.tier}</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{pkg.title}</h2>
                  <p className="text-xl sm:text-2xl font-black text-[#FFD600] font-mono mt-2">
                    {pkg.price}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{pkg.desc}</p>

                  <div className="space-y-2 pt-4 border-t border-white/10 mt-4">
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                      Privileges:
                    </span>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="leading-snug text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/10 mt-6">
                  <a
                    href="#eoi-section"
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      pkg.popular
                        ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02]"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    }`}
                  >
                    <span>Select {pkg.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello! I would like to inquire about reserving ${pkg.title} for No Limit Fest Dubai.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Event with EOI under it */}
        <div id="eoi-section" className="pt-8">
          <EventCardWithEOI event={currentEvent} isInitialExpanded={true} />
        </div>
      </div>
    </div>
  );
}

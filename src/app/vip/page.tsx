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
  title: "VIP Tables & Passes (Early Bird AED 129, Tables for 6, 8, 10) | No Limit Fest Dubai 2026",
  description:
    "Official tickets & ultra-luxury VIP table bookings at Helipad by Frozen Cherry for No Limit Fest Dubai 2026. Early Bird AED 129, Group Passes from AED 400, and VIP Tables for 6, 8, and 10 guests.",
  keywords: [
    "VIP table booking Dubai",
    "Helipad by Frozen Cherry VIP tables",
    "Table for 6 Dubai festival",
    "Table for 8 Dubai concert",
    "Table for 10 VIP cabana Dubai",
    "Dubai nightlife VIP packages",
    "No Limit Fest VIP reservations",
    "No Limit Fest tickets Dubai",
  ],
  alternates: {
    canonical: `${siteConfig.url}/vip`,
  },
  openGraph: {
    title: "VIP Tables & Passes | No Limit Fest Dubai 2026",
    description: "Reserve your Early Bird ticket (AED 129), Group Pass, or VIP Table for 6, 8, or 10 guests at Helipad by Frozen Cherry.",
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
      popular: true,
      desc: "Party together with friends. Group of 3 for AED 400 (~AED 133/person) or Group of 4 for AED 500 (only AED 125/person — best value!).",
      features: [
        "Bundled festival admission passes for 3 or 4 guests",
        "Save up to AED 500 compared to individual event door rates",
        "Live headline concert by RUGER and guest performers",
        "Expedited group check-in and wristband collection",
      ],
    },
    {
      title: "Table for 6",
      tier: "Private Table (6 Guests)",
      price: "Packages from AED 6,500",
      badge: "VIP Deck",
      icon: Crown,
      desc: "An intimate elevated VIP lounge table overlooking the mainstage, with dedicated hostess service and beverage credit.",
      features: [
        "Reserved elevated VIP Lounge Table for up to 6 guests",
        "Fast-track expedited VIP security & check-in queue at the Helipad",
        "AED 3,000 credit towards vintage champagne & premium spirits",
        "Dedicated table hostess & private VIP restroom access",
      ],
    },
    {
      title: "Table for 8",
      tier: "Prime VIP Table (8 Guests)",
      price: "Packages from AED 9,500",
      badge: "Most Popular VIP",
      icon: Crown,
      desc: "Prime center-stage elevation for groups of 8 with expansive panoramic sightlines and top-shelf bottle service.",
      features: [
        "Prime tier elevated VIP table with unobstructed mainstage views",
        "AED 5,000 top-shelf bottle service and vintage champagne credit",
        "Personal table hostess and dedicated security escort",
        "Complimentary chef finger-food platters & VIP parking",
      ],
    },
    {
      title: "Table for 10",
      tier: "VVIP Helipad Deck Cabana (10 Guests)",
      price: "Packages from AED 14,500",
      badge: "Ultra Luxury",
      icon: Crown,
      desc: "The pinnacle of festival hospitality: private center-stage VVIP cabana suite, personal butler, and artist backstage access.",
      features: [
        "Exclusive center-stage VVIP Cabana/Table for 10 guests",
        "AED 8,500 premium vintage champagne & spirits package",
        "Dedicated personal butler, private hostesses & private security",
        "Artist backstage meet & greet opportunity and photo pass",
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
            INDIVIDUAL PASSES & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD600] via-[#FF5722] to-[#FF007F]">TABLE CABANAS</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Redefining festival hospitality on the Dubai waterfront. Select from Individual Passes or private VIP tables for 6, 8, and 10 guests.
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

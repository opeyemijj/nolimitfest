import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { getAllEvents, getTicketTiers } from "@/lib/data-service";
import TicketPurchaseWidget from "@/components/tickets/TicketPurchaseWidget";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Global Tour Stops & Passes (Dubai, GCC & Worldwide) | No Limit Fest",
  description:
    "Explore all official editions of No Limit Fest: Dubai (Oct 2026), Doha, Oman, Bahrain, Saudi Arabia, London, Miami, Lagos, and Tokyo. Instant digital tickets and VIP tables via Stripe.",
  alternates: {
    canonical: `${siteConfig.url}/events`,
  },
  openGraph: {
    title: "No Limit Fest Global Tour | Dubai 2026 Tickets & Passes",
    description:
      "Multi-city festival tour spanning Dubai, Doha, Muscat, Manama, Riyadh, London, Miami, Lagos, and Tokyo.",
    url: `${siteConfig.url}/events`,
    images: ["/images/logo.png"],
  },
};

export default function EventsPage() {
  const events = getAllEvents();
  const currentFlagshipEvent =
    events.find((e) => e.isCurrentEdition) || events[0];
  const flagshipTiers = getTicketTiers(currentFlagshipEvent.id);
  const internationalTourStops = events.filter(
    (e) => e.id !== currentFlagshipEvent.id,
  );

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
            GLOBAL{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">
              TOUR EDITIONS
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Every No Limit Fest city edition features world-class stages,
            international headline acts, and tiered passes for individuals,
            squads, and private VIP tables. Direct checkout with instant digital
            QR pass delivery.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section 1: Flagship Live Edition */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5722]">
                Now On Sale
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>{currentFlagshipEvent.flag}</span>
                <span>Flagship Edition — {currentFlagshipEvent.city}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tickets Active</span>
              </span>
            </div>
          </div>

          {/* Featured Streamlined Ticket Purchase Widget */}
          <TicketPurchaseWidget
            event={currentFlagshipEvent}
            tiers={flagshipTiers}
          />
        </section>

        {/* Section 2: International Tour Schedule Cards Grid */}
        <section className="space-y-8 pt-8 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">
              Upcoming Worldwide Destinations
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              International Tour Schedule
            </h2>
            <p className="text-sm text-gray-400">
              Select any tour stop to explore city passes, lineup previews, and
              early access waitlists:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {internationalTourStops.map((stop) => (
              <div
                key={stop.id}
                className="rounded-3xl bg-[#121524] border border-white/10 p-5 flex flex-col justify-between hover:border-[#00E5FF]/40 hover:bg-[#161A2E] transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{stop.flag}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        stop.status === "waitlist"
                          ? "bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {stop.status === "waitlist" ? "Waitlist" : "Upcoming"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                      {stop.country}
                    </span>
                    <h3 className="text-lg font-black text-white group-hover:text-[#00E5FF] transition-colors">
                      {stop.city}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
                      <span className="text-white font-medium">
                        {stop.dates}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                      <span className="truncate">{stop.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  <Link
                    href={`/events/${stop.slug}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-[#FF5722] hover:to-[#FFD600] hover:text-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View City Passes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

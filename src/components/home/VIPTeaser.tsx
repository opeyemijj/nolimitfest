import Link from "next/link";
import { Crown, Check, Sparkles, ArrowRight, MessageCircle, User } from "lucide-react";
import { getActiveEvent } from "@/data/events";
import { siteConfig } from "@/config/site";

export default function VIPTeaser() {
  const currentEvent = getActiveEvent();

  return (
    <section id="vip" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#08090E] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FFD600]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-xs font-black uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5" />
            <span>Passes & VIP Hospitality</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            INDIVIDUAL PASSES & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD600] via-[#FF5722] to-[#FF007F]">TABLE PACKAGES</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Choose between Individual Passes and private VIP tables for 6, 8, or 10 guests. Dedicated hostesses, bottle service credit, and panoramic mainstage views.
          </p>
        </div>

        {/* 4 Tiers Grid: Individual, Table for 6, Table for 8, Table for 10 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {currentEvent.ticketTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                tier.popular
                  ? "bg-gradient-to-b from-[#1C2032] to-[#111422] border-2 border-[#FF5722] shadow-2xl shadow-orange-500/20 scale-100 lg:-translate-y-2"
                  : "bg-[#11131E] border border-white/10 hover:border-white/20"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white text-[9px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                  {tier.badge}
                </div>
              )}

              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-black uppercase tracking-wider mb-1">
                    {tier.name === "Individual Pass" ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-[#FFD600]" />
                    )}
                    <span>{tier.capacityLabel}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{tier.name}</h3>
                  <p className="text-xl sm:text-2xl font-black text-[#FFD600] mt-2 font-mono">
                    {tier.priceEstimate}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Early allocation via EOI</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-white/10 mb-6">
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                    Included Perks:
                  </span>
                  {tier.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-2 text-xs text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
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
                      ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02]"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  <span>Select {tier.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello! I would like to inquire about reserving ${tier.name} for No Limit Fest Dubai.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

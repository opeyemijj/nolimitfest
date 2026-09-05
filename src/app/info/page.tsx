import { Metadata } from "next";
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  Train, 
  Ship, 
  HeartHandshake, 
  HelpCircle,
  Sparkles,
  Lock
} from "lucide-react";
import FAQSection from "@/components/home/FAQSection";
import { siteConfig } from "@/config/site";
import EOISection from "@/components/eoi/EOISection";

export const metadata: Metadata = {
  title: "Festival Guide, Rules, Age Limit & FAQs | No Limit Fest Dubai 2026",
  description:
    "Official festival attendee guide for No Limit Fest Dubai at Helipad by Frozen Cherry. Saturday 24th October 2026. Age verification (21+), dress code, parking & valet, prohibited items, and full FAQs.",
  keywords: [
    "No Limit Fest Dubai guide",
    "Helipad by Frozen Cherry rules",
    "Dubai festival age limit",
    "Dubai concert bag policy",
    "No Limit Fest FAQs",
    "Helipad Dubai parking",
  ],
  alternates: {
    canonical: `${siteConfig.url}/info`,
  },
  openGraph: {
    title: "Festival Guide & Essential Information | No Limit Fest Dubai 2026",
    description: "Complete guide for attendees: Helipad by Frozen Cherry directions, venue policies, VIP entry, and FAQs.",
    url: `${siteConfig.url}/info`,
    images: ["/images/logo.png"],
  },
};

export default function InfoPage() {
  const policies = [
    {
      title: "Age & ID Verification",
      icon: ShieldCheck,
      color: "text-[#00E5FF]",
      content: "No Limit Fest general grounds are strictly 18+. All VIP, VVIP Cabanas, and licensed bar terraces are strictly 21+. All attendees must present an original government-issued photo ID, Emirates ID, or valid passport. Digital photos or copies are strictly rejected at entry turnstiles.",
    },
    {
      title: "Clear Bag Policy",
      icon: Lock,
      color: "text-[#FFD600]",
      content: "To guarantee expedited entry, only clear transparent plastic/PVC bags (maximum dimensions 30cm x 30cm x 15cm) and small clutches (under 15cm x 20cm) are allowed. Backpacks, oversized duffels, and luggage are prohibited. Secure lockers are available for rental inside gate 2.",
    },
    {
      title: "Prohibited Items",
      icon: AlertTriangle,
      color: "text-[#FF5722]",
      content: "Strictly prohibited: Professional DSLR cameras with detachable zoom lenses, audio recording rigs, drones, selfie sticks, laser pens, aerosol cans, weapons of any nature, outside food or drink, and illicit substances. All guests pass through metal detectors and bag inspection.",
    },
    {
      title: "Accessibility & Inclusion (POD)",
      icon: HeartHandshake,
      color: "text-emerald-400",
      content: "No Limit Fest is proud to welcome People of Determination (POD). The entire venue offers barrier-free wheelchair access, dedicated ADA viewing decks at each stage, accessible luxury restrooms, sensory chill pods, and dedicated guest services escorts.",
    },
  ];

  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      {/* Hero */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-black uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Essential Operations & Policies</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            FESTIVAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#FFD600] to-[#FF5722]">GUIDE & INFO</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Everything required for a seamless, safe, and exhilarating festival experience at the Dubai Waterfront Arena.
          </p>
        </div>
      </div>

      {/* Getting There & Location */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#11131E] border border-white/10 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5722]">
                Location & Venue
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Dubai Festival City Waterfront Arena
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Dubai Festival City Waterfront, Dubai, United Arab Emirates (8 mins from DXB Airport)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#FFD600] bg-white/5 px-4 py-2 rounded-2xl border border-white/10 self-start md:self-auto">
              <Clock className="w-4 h-4" />
              <span>Gates Open: 4:00 PM – 3:00 AM Daily</span>
            </div>
          </div>

          {/* Transit options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#00E5FF] font-bold text-sm">
                <Car className="w-4 h-4" />
                <span>RTA Taxi & Careem / Uber</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Designated festival ride-share pick-up and drop-off loops at Gate 1 and VIP Gate 3. Valet parking available on-site.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#FFD600] font-bold text-sm">
                <Train className="w-4 h-4" />
                <span>Dubai Metro & Shuttles</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect via Green Line to Creek Metro Station or Red Line to Emirates Station, with continuous air-conditioned express festival shuttles.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#FF5722] font-bold text-sm">
                <Ship className="w-4 h-4" />
                <span>Dubai Water Taxi & Marina</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Arrive in style via Dubai Creek water taxi, or book private yacht docking at Dubai Festival City Marina (VIP arrangement).
              </p>
            </div>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Festival <span className="text-[#FF5722]">Policies</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#11131E] border border-white/10 space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                      <Icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{p.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* EOI Section */}
      <EOISection />
    </div>
  );
}

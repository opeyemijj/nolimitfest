import { Metadata } from "next";
import { 
  Mail, 
  MessageCircle, 
  MapPin, 
  Briefcase, 
  Camera, 
  Music, 
  Send,
  Sparkles
} from "lucide-react";
import { siteConfig } from "@/config/site";
import EOISection from "@/components/eoi/EOISection";

export const metadata: Metadata = {
  title: "Contact Organizers (Shurlaybor & Typical Naija) & Concierge | No Limit Fest",
  description:
    "Contact official No Limit Fest executive organizers Shurlaybor Empire and Typical Naija. Brand partnerships, press accreditation, artist submissions, and VIP WhatsApp concierge.",
  keywords: [
    "Contact No Limit Fest",
    "Shurlaybor Empire contact",
    "Typical Naija contact",
    "Dubai festival sponsorships",
    "Festival press accreditation Dubai",
    "VIP concierge WhatsApp Dubai",
  ],
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact Organizers & VIP Concierge | No Limit Fest Dubai",
    description: "Connect directly with Shurlaybor Empire and Typical Naija for sponsorships, press, and table inquiries.",
    url: `${siteConfig.url}/contact`,
    images: ["/images/logo.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      {/* Hero */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/30 text-[#FF6E40] text-xs font-black uppercase tracking-widest">
            <Mail className="w-3.5 h-3.5" />
            <span>Connect With Organizers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            CONTACT & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">PARTNERSHIPS</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Partner with the world’s most exciting emerging music and culture festival. Reach our executive team in Dubai.
          </p>
        </div>
      </div>

      {/* Contact Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[#11131E] border border-white/10 space-y-4">
            <div className="p-3 rounded-2xl bg-[#FF5722]/15 text-[#FF6E40] w-fit">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Brand Sponsorships</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore bespoke stage naming rights, experiential activation pavilions, VIP gifting lounges, and high-impact digital impressions across 65,000+ festivalgoers.
            </p>
            <a
              href={`mailto:${siteConfig.email}?subject=Brand%20Sponsorship%20Inquiry%20-%20No%20Limit%20Fest`}
              className="inline-block text-xs font-bold text-[#FF5722] hover:underline"
            >
              sponsors@nolimitfest.com →
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-[#11131E] border border-white/10 space-y-4">
            <div className="p-3 rounded-2xl bg-[#00E5FF]/15 text-[#00E5FF] w-fit">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Press & Media Accreditation</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Accreditation for international journalists, broadcast networks, music editors, and photojournalists opens 60 days before the festival.
            </p>
            <a
              href={`mailto:${siteConfig.email}?subject=Press%20Accreditation%20Inquiry`}
              className="inline-block text-xs font-bold text-[#00E5FF] hover:underline"
            >
              press@nolimitfest.com →
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-[#11131E] border border-white/10 space-y-4">
            <div className="p-3 rounded-2xl bg-[#FFD600]/15 text-[#FFD600] w-fit">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Artist Submissions</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Emerging DJs, vocalists, and live performers across Afrobeats, Hip-Hop, EDM, and Amapiano can submit EPKs and live festival footage for consideration.
            </p>
            <a
              href={`mailto:${siteConfig.email}?subject=Artist%20Talent%20Submission`}
              className="inline-block text-xs font-bold text-[#FFD600] hover:underline"
            >
              curation@nolimitfest.com →
            </a>
          </div>
        </div>

        {/* WhatsApp Hotline Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#17231E] via-[#121A1A] to-[#11131E] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Direct Festival Hotline
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Chat With Our Festival Director On WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              For rapid response regarding high-priority table bookings, VIP concierge, and international group hospitality packages.
            </p>
          </div>

          <a
            href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              "Hello No Limit Fest Director! I would like to connect directly regarding the Dubai festival."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Launch WhatsApp</span>
          </a>
        </div>
      </div>

      {/* EOI Section */}
      <EOISection
        title="EXPRESSION OF INTEREST"
        subtitle="Fill out the official festival inquiry form below to receive priority access and WhatsApp consultation."
      />
    </div>
  );
}

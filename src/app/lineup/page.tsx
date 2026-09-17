import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Music2,
  Radio,
  Clock,
  MapPin,
  Flame,
  ArrowRight,
  Plus,
} from "lucide-react";
import TicketPurchaseWidget from "@/components/tickets/TicketPurchaseWidget";
import {
  getActiveEvent,
  getAllArtists,
  getTicketTiers,
} from "@/lib/data-service";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Official Lineup: Headliner Ruger Live in Dubai | No Limit Fest 2026",
  description:
    "Official lineup for No Limit Fest Dubai: Headlined by Afrobeats superstar RUGER live at Helipad by Frozen Cherry on Saturday 24th October 2026. Hit anthems 'Asiwaju', 'Bounce', 'Dior', 'Tour'. Supporting artists to be announced. Buy tickets now.",
  keywords: [
    "Ruger live in Dubai",
    "No Limit Fest Lineup",
    "Ruger Dubai concert 2026",
    "Afrobeats artists Dubai 2026",
    "Helipad by Frozen Cherry live performers",
  ],
  alternates: {
    canonical: `${siteConfig.url}/lineup`,
  },
  openGraph: {
    title: "Ruger (Official Headliner) Live at No Limit Fest Dubai 2026",
    description:
      "Official Lineup starring Headliner Ruger at Helipad by Frozen Cherry, Dubai. Saturday 24th October 2026 (6PM Till Late).",
    url: `${siteConfig.url}/lineup`,
    images: [
      {
        url: "/images/artists/ruger.jpg",
        width: 1080,
        height: 1920,
        alt: "Ruger Live at No Limit Fest Dubai",
      },
    ],
  },
};

export default function LineupPage() {
  const currentEvent = getActiveEvent();
  const artists = getAllArtists();
  const tiers = getTicketTiers(currentEvent.id);

  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      {/* Lineup Hero */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00E5FF]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/30 text-[#FF6E40] text-xs font-black uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Dubai Premiere • Saturday 24th Oct 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            THE OFFICIAL{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">
              ARTIST LINEUP
            </span>
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            <span className="font-bold text-[#FFD600] uppercase tracking-wide block sm:inline mr-1">
              Music, Energy, No limit.
            </span>
            Headlined by Afrobeats powerhouse{" "}
            <strong className="text-[#FF5722]">RUGER</strong> live at the iconic
            Helipad by Frozen Cherry.
          </p>
        </div>
      </div>

      {/* Headliners Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className={`group relative rounded-3xl overflow-hidden bg-[#131624] border transition-all duration-300 shadow-2xl flex flex-col justify-between ${
                artist.role === "Headliner"
                  ? "border-amber-500/50 shadow-orange-500/10 ring-1 ring-amber-500/30"
                  : "border-white/15 hover:border-[#00E5FF]"
              }`}
            >
              <div>
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-black/40">
                  <Image
                    src={artist.image || "/images/artists/ruger.jpg"}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131624] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                      {artist.role}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase">
                      {artist.genre}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {artist.origin}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
                      <span className="font-bold text-white">
                        {artist.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                      <span>{artist.stage}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {artist.bio}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/10 flex items-center justify-between mt-4">
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Music2 className="w-3.5 h-3.5" />
                  <span>Listen on Spotify</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Event Ticket Purchase Widget */}
        <div id="tickets" className="pt-8">
          <TicketPurchaseWidget event={currentEvent} tiers={tiers} />
        </div>
      </div>
    </div>
  );
}

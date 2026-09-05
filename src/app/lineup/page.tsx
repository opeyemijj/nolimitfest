import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  Music2, 
  Sparkles, 
  Radio, 
  Clock, 
  MapPin, 
  Flame, 
  ArrowRight,
  Plus
} from "lucide-react";
import EventCardWithEOI from "@/components/events/EventCardWithEOI";
import { getActiveEvent } from "@/data/events";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Official Lineup: Headliner Ruger & Undercard Fido | No Limit Fest Dubai 2026",
  description:
    "Official lineup for No Limit Fest Dubai: Headlined by Afrobeats superstar RUGER with official undercard performance by FIDO live at Helipad by Frozen Cherry on Saturday 24th October 2026. Hit anthems 'Asiwaju', 'Bounce', 'Dior', 'Awolowo'. Register EOI now.",
  keywords: [
    "Ruger live in Dubai",
    "Fido live in Dubai",
    "No Limit Fest Lineup",
    "Ruger Dubai concert 2026",
    "Fido Awolowo Dubai",
    "Afrobeats artists Dubai 2026",
    "Helipad by Frozen Cherry live performers",
  ],
  alternates: {
    canonical: `${siteConfig.url}/lineup`,
  },
  openGraph: {
    title: "Ruger (Headliner) & Fido (Undercard) Live at No Limit Fest Dubai 2026",
    description: "Official Lineup starring Headliner Ruger and Undercard Fido at Helipad by Frozen Cherry, Dubai. Saturday 24th October 2026 (6PM Till Late).",
    url: `${siteConfig.url}/lineup`,
    images: [
      {
        url: "/images/artists/ruger.jpg",
        width: 1080,
        height: 1920,
        alt: "Ruger Live at No Limit Fest Dubai",
      },
      {
        url: "/images/artists/fido.jpg",
        width: 1080,
        height: 1920,
        alt: "Fido Live at No Limit Fest Dubai",
      },
    ],
  },
};

export default function LineupPage() {
  const currentEvent = getActiveEvent();

  const headliners = [
    {
      id: "ruger",
      name: "RUGER",
      role: "Headliner",
      subtitle: "Global Afrobeats Superstar",
      date: "Saturday 24th October 2026",
      time: "11:30 PM - Late",
      venue: "Helipad by Frozen Cherry",
      image: "/images/artists/ruger.jpg",
      hits: ["Asiwaju", "Bounce", "Dior", "Tour"],
      spotifyUrl: "https://open.spotify.com/artist/05h1s39qL0tD2a3P6kHl7h",
      bio: "Global Afrobeats icon and multi-platinum sensation recognized worldwide for his signature eyepatch, magnetic stage presence, and record-shattering worldwide stadium anthems.",
    },
    {
      id: "fido",
      name: "FIDO",
      role: "Undercard",
      subtitle: "Official Undercard Sensation",
      date: "Saturday 24th October 2026",
      time: "9:45 PM - 11:15 PM",
      venue: "Helipad by Frozen Cherry",
      image: "/images/artists/fido.jpg",
      hits: ["Awolowo", "Joy", "Vibe Machine"],
      spotifyUrl: "https://open.spotify.com",
      bio: "Viral breakout sensation sweeping streaming charts across Africa and the diaspora with massive anthems like 'Awolowo', delivering unstoppable rhythm and high-octane energy as the official undercard act.",
    },
  ];

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
            THE OFFICIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">ARTIST LINEUP</span>
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Headlined by Nigerian Afrobeats icon <strong className="text-white">RUGER</strong> with high-octane undercard direct support by <strong className="text-white">FIDO</strong> performing live at <strong className="text-white">Helipad by Frozen Cherry, Dubai</strong>. 6PM Till Late.
          </p>
        </div>
      </div>

      {/* Headliners Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {headliners.map((artist) => (
            <div
              key={artist.id}
              className={`group relative rounded-3xl overflow-hidden bg-[#131624] border transition-all duration-300 shadow-2xl flex flex-col justify-between ${
                artist.role === "Headliner"
                  ? "border-amber-500/50 shadow-orange-500/10 ring-1 ring-amber-500/30"
                  : "border-white/15 hover:border-[#00E5FF]"
              }`}
            >
              <div className="relative aspect-[9/13] w-full overflow-hidden">
                <Image
                  src={artist.image}
                  alt={`${artist.name} Live at No Limit Fest Dubai`}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131624] via-[#131624]/30 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full backdrop-blur-md text-xs font-black uppercase ${
                    artist.role === "Headliner"
                      ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black shadow-lg"
                      : "bg-black/70 border border-[#00E5FF]/40 text-[#00E5FF]"
                  }`}>
                    {artist.role === "Headliner" ? "★ HEADLINER ★" : "★ UNDERCARD ★"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                    Oct 24 • Dubai
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">
                    {artist.subtitle}
                  </span>
                  <h2 className="text-3xl font-black text-white group-hover:text-[#FF5722] transition-colors">
                    {artist.name}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {artist.bio}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>Venue:</span>
                    </span>
                    <span className="font-bold text-white">{artist.venue}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FFD600]" />
                      <span>Set Time:</span>
                    </span>
                    <span className="font-mono text-[#FFD600] font-bold">{artist.time}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Hit Songs:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {artist.hits.map((h) => (
                      <span key={h} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-gray-200">
                        ♪ {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <a
                    href={artist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Music2 className="w-4 h-4" />
                    <span>Listen on Spotify</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Third Card: More Artists To Join In */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#171A29] to-[#0E1019] border-2 border-dashed border-white/20 flex flex-col justify-between text-center relative overflow-hidden group hover:border-[#00E5FF]/60 transition-all">
            <div className="space-y-4 my-auto py-10">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-[#00E5FF] group-hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#FFD600]">
                  Lineup Update
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  MORE ARTISTS TO JOIN IN
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                Additional performers and supporting acts will be announced as we get closer to Saturday 24th October. Stay tuned.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <a
                href="#event-dubai"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
              >
                <span>Register Interest Below</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Dedicated Event with 4 pass types and embedded EOI under it */}
        <div className="pt-8">
          <EventCardWithEOI event={currentEvent} isInitialExpanded={true} />
        </div>
      </div>
    </div>
  );
}

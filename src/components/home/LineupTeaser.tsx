import Image from "next/image";
import Link from "next/link";
import { Sparkles, Music2, Flame, ArrowRight, Radio, Plus } from "lucide-react";

export default function LineupTeaser() {
  const headliners = [
    {
      id: "ruger",
      name: "RUGER",
      role: "Headliner",
      subtitle: "Global Afrobeats Superstar",
      date: "Saturday 24th October 2026",
      venue: "Helipad by Frozen Cherry",
      image: "/images/artists/ruger.jpg",
      hits: ["Asiwaju", "Bounce", "Dior", "Tour"],
      spotifyUrl: "https://open.spotify.com/artist/05h1s39qL0tD2a3P6kHl7h",
      bio: "Global Afrobeats powerhouse famous for his signature eyepatch, magnetic vocals, and record-shattering worldwide stadium anthems.",
      color: "from-[#FF5722] to-[#FFD600]",
    },
    {
      id: "fido",
      name: "FIDO",
      role: "Headliner",
      subtitle: "Viral Afrobeats Sensation",
      date: "Saturday 24th October 2026",
      venue: "Helipad by Frozen Cherry",
      image: "/images/artists/fido.jpg",
      hits: ["Awolowo", "Joy", "Vibe Machine"],
      spotifyUrl: "https://open.spotify.com",
      bio: "Unstoppable breakout sensation sweeping streaming charts and concert stages with high-energy crowd favorites and irresistible rhythm.",
      color: "from-[#00E5FF] to-[#FF5722]",
    },
  ];

  return (
    <section id="lineup" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0D15] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#00E5FF]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header - Simple & Clean */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/30 text-[#FF6E40] text-xs font-black uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Dubai Headliners Announcement</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            THE WORLD&apos;S <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">GREATEST LINEUP</span>
          </h2>

          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Headlined by Afrobeats icons <strong className="text-white">RUGER</strong> and <strong className="text-white">FIDO</strong> live on the Dubai waterfront. Saturday 24th October 2026.
          </p>
        </div>

        {/* Headliner Cards Grid + More To Join Teaser */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Ruger Card */}
          {headliners.map((artist) => (
            <div
              key={artist.id}
              className="group relative rounded-3xl overflow-hidden bg-[#131624] border border-white/15 hover:border-[#FF5722] transition-all duration-300 hover:-translate-y-2 shadow-2xl flex flex-col justify-between"
            >
              <div className="relative aspect-[9/13] w-full overflow-hidden">
                <Image
                  src={artist.image}
                  alt={`${artist.name} Live at No Limit Fest Dubai`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131624] via-[#131624]/30 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-black uppercase text-white">
                    {artist.role}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                    Oct 24 • Dubai
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">
                    {artist.subtitle}
                  </span>
                  <h3 className="text-3xl font-black text-white group-hover:text-[#FF5722] transition-colors">
                    {artist.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {artist.bio}
                </p>

                {/* Popular tracks */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Hit Anthems:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {artist.hits.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-200"
                      >
                        ♪ {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">
                    {artist.venue}
                  </span>

                  <a
                    href={artist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-emerald-400 text-xs font-bold transition-colors"
                  >
                    <Music2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Third Card: More Artists To Join In */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#171A29] to-[#0E1019] border-2 border-dashed border-white/20 flex flex-col justify-between text-center relative overflow-hidden group hover:border-[#00E5FF]/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#FF5722]/5 pointer-events-none" />

            <div className="space-y-4 my-auto py-8">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-[#00E5FF] group-hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#FFD600]">
                  Phase 2 Incoming
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  MORE ARTISTS TO JOIN IN
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                Additional international guest performers, supporting Afrobeats stars, and Dubai&apos;s top DJs will be unveiled shortly.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <a
                href="#events"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
              >
                <span>Register EOI for Dubai</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-gray-500">
                Lock in early bird allocation before phase 2 release
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

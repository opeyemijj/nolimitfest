import Image from "next/image";
import { Zap, Volume2, Sparkles, Flame, Eye, Users } from "lucide-react";
import { festivalStages } from "@/data/stages";

export default function StagePreview() {
  return (
    <section id="stages" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#08090E] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-black uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            <span>State-Of-The-Art Production</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            4 COLOSSAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">MEGA STAGES</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Custom engineered architectural wonders featuring stadium-scale pyro, 360-degree holographic LED arrays, and world-class concert acoustic systems.
          </p>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {festivalStages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-3xl bg-[#11131E] border border-white/10 overflow-hidden hover:border-[#FF5722]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between group"
            >
              {/* Image & Stage Header */}
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={stage.image}
                  alt={`${stage.name} No Limit Fest Dubai`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11131E] via-[#11131E]/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-black text-[#00E5FF] uppercase">
                    {stage.subtitle}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#FF5722] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                    <Users className="w-3.5 h-3.5" />
                    <span>{stage.capacity}</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#FF5722] transition-colors">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-gray-300 font-medium mt-1">
                    {stage.tagline}
                  </p>
                </div>
              </div>

              {/* Stage Description & Specs */}
              <div className="p-6 space-y-5">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {stage.description}
                </p>

                {/* Production Specs Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#00E5FF] font-bold">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Engineering</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-snug">{stage.production.audio}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#FFD600] font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Lighting & Lasers</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-snug">{stage.production.lighting}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#FF5722] font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Special FX & Pyro</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-snug">{stage.production.pyro}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#FF007F] font-bold">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visual Architecture</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-snug">{stage.production.visuals}</p>
                  </div>
                </div>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider self-center">
                    Genres:
                  </span>
                  {stage.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-semibold text-gray-300 border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

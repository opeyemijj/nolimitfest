import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Utensils, 
  Palette, 
  Shirt, 
  Sunset, 
  Zap, 
  Flame, 
  Heart, 
  Compass,
  ArrowRight
} from "lucide-react";
import EOISection from "@/components/eoi/EOISection";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "The Festival Experience & Stages | No Limit Fest Dubai 2026",
  description:
    "Immerse yourself in the sunset festival experience at Helipad by Frozen Cherry, Dubai. Panoramic skyline views, world-class sound, artisan mixology, and high-energy Afrobeats.",
  keywords: [
    "Helipad by Frozen Cherry experience",
    "Dubai sunset music festival",
    "No Limit Fest stages",
    "Dubai waterfront festival experience",
    "Afrobeats Dubai nightlife",
  ],
  alternates: {
    canonical: `${siteConfig.url}/experience`,
  },
  openGraph: {
    title: "The Festival Experience | No Limit Fest Dubai 2026",
    description: "Helipad sunset views, world-class sound matrix, luxury VIP tables, and live performances by Ruger & Fido.",
    url: `${siteConfig.url}/experience`,
    images: ["/images/logo.png"],
  },
};

export default function ExperiencePage() {
  const pillars = [
    {
      title: "Sound & Holographic Production",
      subtitle: "Sensory Overdrive",
      description: "Engineered in partnership with world-renowned stage designers, each stage incorporates 360° transparent microLED rings, 40-watt geometric lasers, and custom L-Acoustics arrays engineered to rattle your chest while maintaining crystalline vocal clarity.",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
      icon: Zap,
    },
    {
      title: "The Global Culinary Boulevard",
      subtitle: "Michelin & Street Food Fusion",
      description: "Tantalize your palate with 40+ curated culinary outposts representing the flavor capitals of the world. From smoking Texas BBQ briskets and crispy Lagos Suya skewers to artisanal Neapolitan pizzas, plant-based gastronomy, and decadent Dubai dessert creations.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      icon: Utensils,
    },
    {
      title: "Live Street Art & Mural Battles",
      subtitle: "Urban Expression",
      description: "Curated by leading international graffiti legends and digital artists. Watch giant 30-foot shipping container installations transform into vibrant masterpieces before your eyes throughout the weekend, complemented by AR visual mirrors and projection mapping.",
      image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=1200&q=80",
      icon: Palette,
    },
    {
      title: "Streetwear Arcade & Merch Drops",
      subtitle: "Exclusive Festival Fashion",
      description: "Step into our climate-controlled retail village featuring capsule collaborations with global streetwear designers, customized sneaker restoration bars, commemorative vinyl popups, and custom screen-printing stations to personalize your festival gear.",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
      icon: Shirt,
    },
    {
      title: "Sunset Drone & Pyro Choreography",
      subtitle: "The Dubai Skyline Illuminated",
      description: "Each dusk, 1,000 synchronized illuminated drones take flight over Dubai Creek in tandem with stadium-scale pyrotechnics and aquatic laser projectors, telling the story of global music connectivity in the desert sky.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
      icon: Sunset,
    },
    {
      title: "Sensory Chillout Havens & Oasis Pods",
      subtitle: "Rest, Recharge & Connect",
      description: "Need a moment between headliner sets? Enjoy shaded botanical chillout zones equipped with high-speed charging bars, holistic sound baths, hydration bars with zero-proof elixirs, and misting fans.",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
      icon: Heart,
    },
  ];

  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      {/* Experience Hero */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Multi-Sensory Universe</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            THE NO LIMIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD600] via-[#FF5722] to-[#00E5FF]">EXPERIENCE</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            More than a festival — an epic gathering of music, culinary excellence, visionary street art, and global festival culture under the Dubai skies.
          </p>
        </div>
      </div>

      {/* Pillars Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#11131E] border border-white/10 overflow-hidden hover:border-[#FF5722]/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11131E] via-[#11131E]/40 to-transparent" />

                  <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-[#FF5722]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
                      {item.subtitle}
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-[#FF5722] transition-colors mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EOI Banner */}
      <EOISection
        title="EXPERIENCE IT FIRST-HAND"
        subtitle="Secure your place in festival history. Register your Expression of Interest for the Dubai premiere."
      />
    </div>
  );
}

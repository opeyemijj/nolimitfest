import Image from "next/image";
import Link from "next/link";
import { Utensils, Palette, Shirt, Sunset, ArrowRight, Sparkles } from "lucide-react";

export default function ExperienceGrid() {
  const experiences = [
    {
      title: "Global Culinary Oasis",
      category: "Gastronomy",
      desc: "Over 40 award-winning international food concepts, curated street vendors from Lagos to Tokyo, artisanal smash burgers, authentic Middle Eastern kebabs, vegan delicacies, and gourmet dessert parlors.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      icon: Utensils,
      color: "text-[#FFD600]",
    },
    {
      title: "Live Street Art & Graffiti Murals",
      category: "Urban Culture",
      desc: "Witness monumental live spray-can battles, interactive neon light tunnels, augmented-reality art installations, and monumental sculptures designed by celebrated contemporary street artists.",
      image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=1200&q=80",
      icon: Palette,
      color: "text-[#FF5722]",
    },
    {
      title: "Exclusive Fashion & Streetwear Pop-Ups",
      category: "Style & Merch",
      desc: "Cop limited-edition No Limit Fest Dubai tour merchandise, custom embroidery stations, sneaker customizers, festival glam & glitter booths, and vintage streetwear pop-ups.",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
      icon: Shirt,
      color: "text-[#00E5FF]",
    },
    {
      title: "Waterfront Drone Spectacles & Chill Havens",
      category: "Spectacle",
      desc: "As the sun dips beneath the Arabian Gulf, 1,000 synchronized drones illuminate the night sky with kinetic 3D choreography accompanied by festival fireworks over Dubai Creek.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
      icon: Sunset,
      color: "text-[#FF007F]",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0D15] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Beyond The Music</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              THE NO LIMIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD600] to-[#FF5722]">EXPERIENCE</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-xl">
              Immerse your senses in a three-day celebration where music, urban fashion, world-class gastronomy, and futuristic art collide.
            </p>
          </div>

          <Link
            href="/experience"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold transition-all hover:scale-105 self-start md:self-auto"
          >
            <span>Explore Culture & Art</span>
            <ArrowRight className="w-4 h-4 text-[#FF5722]" />
          </Link>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiences.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-3xl overflow-hidden bg-[#131624] border border-white/10 hover:border-white/30 transition-all duration-300 shadow-xl"
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131624] via-[#131624]/50 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-black text-white uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FF5722] transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

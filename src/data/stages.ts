export interface Stage {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  image: string;
  genres: string[];
  capacity: string;
  production: {
    audio: string;
    lighting: string;
    pyro: string;
    visuals: string;
  };
}

export const festivalStages: Stage[] = [
  {
    id: "mainstage",
    name: "The Infinite Mainstage",
    subtitle: "Epicenter of Global Sound",
    tagline: "Where the world's biggest headline acts shatter gravity.",
    description: "A colossal 75-meter architectural monument featuring 360-degree curved ultra-high-definition LED panels, cryogenic nitrogen cannons, synchronized fireworks, and festival-grade L-Acoustics K1 line arrays.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    genres: ["Afrobeats", "Hip-Hop", "EDM", "Stadium Pop"],
    capacity: "45,000+ Revelers",
    production: {
      audio: "L-Acoustics K1/K2 System with KS28 Subwoofers (142 dB SPL)",
      lighting: "1,200+ Robe & Claypaky Moving Heads with 40-Watt Laser Arrays",
      pyro: "Sync'd Stadium Flame Jets & High-Altitude Waterfront Fireworks",
      visuals: "1,800 sqm 8K Transparent MicroLED Displays",
    },
  },
  {
    id: "afro-oasis",
    name: "Afro-Oasis Dome",
    subtitle: "Rhythms of the Motherland",
    tagline: "The heartbeat of Afro-fusion, Amapiano, and high-energy street dance.",
    description: "Immerse yourself under an organic tension-fabric geodesic dome pulsating with warm percussion, live brass ensembles, and authentic tropical street food aromas.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    genres: ["Afrobeats", "Amapiano", "Highlife", "Afro-House"],
    capacity: "20,000 Dancers",
    production: {
      audio: "d&b audiotechnik GSL Series tuned for deep sub-bass frequencies",
      lighting: "Warm amber, gold & sunset washes with kinetic ring ceiling",
      pyro: "CO2 jets & ambient haze systems",
      visuals: "Interactive 3D tribal mapping and live percussion reactive visuals",
    },
  },
  {
    id: "cyber-underground",
    name: "Neon Cyber-Underground",
    subtitle: "Bass & Raw Energy Zone",
    tagline: "High-octane drill, underground techno, and trap moshpits.",
    description: "Engineered inside an industrial matrix structure draped in neon cage scaffolds, laser tunnels, and heavy sub-bass tuned for purists and adrenaline junkies.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    genres: ["Trap", "UK Drill", "Tech House", "Bassline"],
    capacity: "15,000 Fans",
    production: {
      audio: "Funktion-One Vero Sound Matrix delivering visceral physical punch",
      lighting: "Full strobing geometric laser grid and industrial cage LED bars",
      pyro: "Flame pods and low-lying atmospheric fog",
      visuals: "Glitch-art projection mapping and cyberpunk typography rigs",
    },
  },
  {
    id: "sky-lounge",
    name: "The Horizon VIP Deck",
    subtitle: "Ultra-Luxury Festival Hospitality",
    tagline: "Panoramic waterfront views, world-class bottle service, and private acoustics.",
    description: "An elevated three-tier terrace overlooking all mainstage spectacles, featuring dedicated mixologists, Michelin-inspired catering bites, air-conditioned chillout pods, and private luxury restrooms.",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
    genres: ["Curated Sunset Vibes", "Acoustic VIP Sets", "Melodic Sessions"],
    capacity: "3,500 VIP Guests",
    production: {
      audio: "Custom Void Acoustics Air Motion golden horn speakers",
      lighting: "Bespoke ambient chandeliers and subdued architectural illumination",
      pyro: "Private viewing balcony for main fireworks exhibitions",
      visuals: "Ultra-thin OLED informational panels and live multi-cam stage feeds",
    },
  },
];

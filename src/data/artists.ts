export interface Artist {
  id: string;
  name: string;
  role: "Headliner" | "Co-Headliner" | "Undercard" | "Special Guest" | "Supporting Act";
  genre: "Afrobeats" | "Hip-Hop" | "EDM / Electronic" | "Amapiano" | "Latin & Pop";
  day: "Day 1" | "Day 2" | "Day 3";
  stage: string;
  time: string;
  image: string;
  bio: string;
  origin: string;
  hits: string[];
  spotifyUrl: string;
}

export const festivalArtists: Artist[] = [
  {
    id: "ruger",
    name: "RUGER",
    role: "Headliner",
    genre: "Afrobeats",
    day: "Day 1",
    stage: "Helipad Mainstage",
    time: "11:30 PM - Late",
    image: "/images/artists/ruger.jpg",
    bio: "Global Afrobeats icon and multi-platinum sensation recognized worldwide for his signature eyepatch, magnetic stage presence, and chart-topping hits like 'Asiwaju', 'Bounce', and 'Dior'.",
    origin: "Lagos, Nigeria",
    hits: ["Asiwaju", "Bounce", "Dior", "Tour"],
    spotifyUrl: "https://open.spotify.com/artist/05h1s39qL0tD2a3P6kHl7h",
  },
  {
    id: "dj-mirage",
    name: "DJ OMAR MIRAGE",
    role: "Supporting Act",
    genre: "EDM / Electronic",
    day: "Day 1",
    stage: "Helipad Sunset Terrace",
    time: "6:00 PM - 8:00 PM",
    image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1200&q=80",
    bio: "Dubai's premier sunset selector setting the golden hour mood over the Dubai skyline with melodic afro-house and deep grooves.",
    origin: "Dubai, UAE",
    hits: ["Helipad Sunset", "Arabian Synths"],
    spotifyUrl: "https://open.spotify.com",
  },
  {
    id: "amapiano-royals",
    name: "AMAPIANO ROYALS",
    role: "Special Guest",
    genre: "Amapiano",
    day: "Day 1",
    stage: "Helipad Mainstage",
    time: "8:00 PM - 9:45 PM",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    bio: "The masters of heavy log-drum syncopation and soulful South African piano melodies keeping the dancefloor ablaze.",
    origin: "Johannesburg, South Africa",
    hits: ["Piano Sunset", "Soweto Groove"],
    spotifyUrl: "https://open.spotify.com",
  },
];

import Link from "next/link";
import Image from "next/image";
import { 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Mail, 
  Music, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { festivalEvents } from "@/data/events";

export default function Footer() {
  return (
    <footer className="relative bg-[#05060A] border-t border-white/10 text-gray-400 pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group" aria-label="No Limit Fest">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="No Limit Fest"
                  fill
                  className="object-contain drop-shadow-[0_0_25px_rgba(255,87,34,0.5)]"
                />
              </div>
            </Link>

            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              No Limit Fest is a global music, art, and urban culture spectacle curating the world’s most iconic talents across Afrobeats, Hip-Hop, Electronic, Amapiano, and Latin sounds. Elevating live entertainment with boundary-pushing stage architecture and luxury hospitality.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#FF5722] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={siteConfig.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#00E5FF] transition-colors"
                aria-label="TikTok"
              >
                <Music className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter / X"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#FF007F] transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD600]" />
              <span>Explore Fest</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/lineup" className="hover:text-white transition-colors">
                  Dubai Artist Lineup
                </Link>
              </li>
              <li>
                <Link href="/experience" className="hover:text-white transition-colors">
                  Festival Experience & Art
                </Link>
              </li>
              <li>
                <Link href="/vip" className="hover:text-white transition-colors">
                  VIP Cabanas & Hospitality
                </Link>
              </li>
              <li>
                <Link href="/#stages" className="hover:text-white transition-colors">
                  Stages & Sound Matrix
                </Link>
              </li>
              <li>
                <Link href="/#eoi" className="text-[#FF6E40] font-semibold hover:text-[#FF5722] transition-colors">
                  Register Interest (EOI)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Global Tour Cities */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Global Tour</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              {festivalEvents.map((evt) => (
                <li key={evt.id}>
                  <Link
                    href={`/events/${evt.slug}`}
                    className="flex items-center justify-between hover:text-white transition-colors"
                  >
                    <span>
                      {evt.flag} {evt.city}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {evt.year}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Festival Concierge & Info */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4">
              Festival Concierge
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-gray-300">
                  {siteConfig.dubaiEdition.venue}, Dubai, UAE
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#00E5FF] shrink-0" />
                <span className="text-xs text-gray-300">
                  {siteConfig.dubaiEdition.dates}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FFD600] shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="text-xs text-gray-300 hover:text-white">
                  {siteConfig.email}
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    "Hello! I am inquiring about No Limit Fest."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Lead Hotline</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Festival Organizers Section */}
        <div className="my-10 pt-10 border-t border-white/10">
          <div className="rounded-3xl bg-[#0E111C]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            {/* Background glowing gradients */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FFD600]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              {/* Heading & Subtitle */}
              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 text-[#FFD600] text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  <span>Executive Organizers</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  ORGANIZED &amp; PRESENTED BY
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  No Limit Fest is proudly organized and produced by <strong className="text-[#FFD600]">Shurlaybor Empire</strong> and <strong className="text-emerald-400">Typical Naija</strong>.
                </p>
              </div>

              {/* Organizer Logos Showcase */}
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
                {/* Shurlaybor Empire */}
                <div className="flex flex-col items-center gap-2.5 group">
                  <div className="relative h-20 sm:h-24 w-36 sm:w-44 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/organizers/shurlaybor.png"
                      alt="Shurlaybor Empire - Official Festival Organizer"
                      fill
                      className="object-contain filter drop-shadow-[0_0_20px_rgba(255,214,0,0.35)]"
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-300 group-hover:text-[#FFD600] transition-colors">
                    Shurlaybor Empire
                  </span>
                </div>

                <div className="hidden sm:block w-px h-16 bg-white/15" />

                {/* Typical Naija */}
                <div className="flex flex-col items-center gap-2.5 group">
                  <div className="relative h-20 sm:h-24 w-44 sm:w-56 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/organizers/typical-naija.png"
                      alt="Typical Naija - Official Festival Organizer"
                      fill
                      className="object-contain filter drop-shadow-[0_0_20px_rgba(0,230,118,0.35)]"
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-300 group-hover:text-emerald-400 transition-colors">
                    Typical Naija
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>© {new Date().getFullYear()} No Limit Fest Worldwide Ltd. All Rights Reserved. Licensed Event in Dubai, UAE.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/info" className="hover:text-gray-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/info" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/info" className="hover:text-gray-300 transition-colors">
              Bag Policy & Safety
            </Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">
              Sponsor Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

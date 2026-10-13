import { MapPin, Maximize2 } from "lucide-react";
import VenueLink from "@/components/layout/VenueLink";

/**
 * Dubai edition seating map (Helipad by Frozen Cherry).
 * Serves a lighter WebP on phones and the full-resolution WebP on larger screens;
 * tapping the map opens the full-size image in a new tab.
 */
export default function SeatingMap({ id = "seating-map" }: { id?: string }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-3xl bg-[#11131E] border border-white/10 p-4 sm:p-6 lg:p-8 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#FF5722]">
            Dubai • 1st Edition
          </p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Seating Map
          </h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
            <VenueLink>Helipad by Frozen Cherry, Dubai</VenueLink>
          </p>
        </div>
        <a
          href="/images/seating-map.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>View Full Size</span>
        </a>
      </div>

      <a
        href="/images/seating-map.jpg"
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10"
      >
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/images/seating-map-mobile.webp"
            type="image/webp"
          />
          <source srcSet="/images/seating-map.webp" type="image/webp" />
          <img
            src="/images/seating-map.jpg"
            alt="No Limit Fest Dubai seating map: VVIP tables 01–14 behind the DJ booth, standing tables 31–33, sofa tables 34–36, VIP cabanas 41–50 and the general admission dance floor at Helipad by Frozen Cherry"
            width={1600}
            height={2000}
            loading="lazy"
            decoding="async"
            className="w-full h-auto"
          />
        </picture>
      </a>

      <p className="text-[11px] text-gray-400 text-center">
        Pay a 20% deposit to hold any table. Balance is paid at check-in. Table
        prices are minimum spend.
      </p>
    </section>
  );
}

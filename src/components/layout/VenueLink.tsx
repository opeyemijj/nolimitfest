import { siteConfig } from "@/config/site";

export const VENUE_MAP_URL = siteConfig.dubaiEdition.mapUrl;

/**
 * True when a venue string refers to the Dubai host venue (Helipad by Frozen Cherry).
 */
export function isMappedVenue(venue?: string | null): boolean {
  return Boolean(venue && venue.toLowerCase().includes("helipad"));
}

/**
 * Wraps venue text in a Google Maps link without altering its appearance
 * (inherits color, no underline). When `venue` is passed and is not the
 * mapped venue (e.g. other tour cities), children render unlinked.
 */
export default function VenueLink({
  children,
  venue,
}: {
  children: React.ReactNode;
  venue?: string | null;
}) {
  if (venue !== undefined && !isMappedVenue(venue)) {
    return <>{children}</>;
  }
  return (
    <a href={VENUE_MAP_URL} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

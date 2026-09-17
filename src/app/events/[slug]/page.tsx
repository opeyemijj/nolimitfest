import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import {
  getEventBySlug,
  getAllEvents,
  getTicketTiers,
} from "@/lib/data-service";
import TicketPurchaseWidget from "@/components/tickets/TicketPurchaseWidget";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((evt) => ({
    slug: evt.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | No Limit Fest" };
  }

  const isDubai = event.isCurrentEdition;
  const title = isDubai
    ? `${event.name} Dubai 2026 | Ruger Live | Buy Tickets & VIP Tables`
    : `${event.name} (${event.city}) | Tickets & Waitlist`;

  const desc = isDubai
    ? `Saturday 24th October 2026 at Helipad by Frozen Cherry, Dubai. Starring Headliner Ruger. Individual Passes, Squad Passes, and VIP Tables. Instant digital QR pass via Stripe.`
    : `Official ${event.name} in ${event.city}, ${event.country}. ${event.tagline} Direct passes and VIP Table allocations.`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${siteConfig.url}/events/${event.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `${siteConfig.url}/events/${event.slug}`,
      images: [
        {
          url: event.heroImage.startsWith("http")
            ? event.heroImage
            : `${siteConfig.url}${event.heroImage}`,
          alt: `${event.name} ${event.city}`,
        },
      ],
    },
  };
}

export default async function SingleEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const tiers = await getTicketTiers(event.id);

  return (
    <div className="pt-28 pb-20 bg-[#08090E] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Festival Cities</span>
        </Link>

        {/* Dedicated Event Ticket Purchase Storefront */}
        <TicketPurchaseWidget event={event} tiers={tiers} />
      </div>
    </div>
  );
}

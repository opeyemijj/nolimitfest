import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";
import { festivalEvents, getEventBySlug } from "@/data/events";
import EventCardWithEOI from "@/components/events/EventCardWithEOI";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return festivalEvents.map((evt) => ({
    slug: evt.slug,
  }));
}

import { siteConfig } from "@/config/site";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | No Limit Fest" };
  }

  const isDubai = event.isCurrentEdition;
  const title = isDubai
    ? `${event.name} Dubai 2026 | Ruger & Fido Live | Tickets & VIP Tables`
    : `${event.name} (${event.city}) | Waitlist, Passes & EOI Registration`;

  const desc = isDubai
    ? `Saturday 24th October 2026 at Helipad by Frozen Cherry, Dubai. Starring Ruger & Fido. Individual Passes, Table for 6, Table for 8, Table for 10. Register Expression of Interest.`
    : `Official ${event.name} in ${event.city}, ${event.country}. ${event.tagline} Register Expression of Interest for Individual Passes and VIP Table allocations on WhatsApp.`;

  return {
    title,
    description: desc,
    keywords: [
      `${event.name}`,
      `${event.city} music festival`,
      `${event.city} concerts 2026`,
      `${event.venue}`,
      `VIP table ${event.city}`,
      `Afrobeats ${event.city}`,
      "No Limit Fest",
    ],
    alternates: {
      canonical: `${siteConfig.url}/events/${event.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `${siteConfig.url}/events/${event.slug}`,
      images: [
        {
          url: event.heroImage.startsWith("http") ? event.heroImage : `${siteConfig.url}${event.heroImage}`,
          alt: `${event.name} ${event.city}`,
        },
      ],
    },
  };
}

export default async function SingleEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

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

        {/* Dedicated Event with 4 pass types and embedded EOI under it */}
        <EventCardWithEOI event={event} isInitialExpanded={true} />
      </div>
    </div>
  );
}

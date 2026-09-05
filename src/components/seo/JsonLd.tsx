import { siteConfig } from "@/config/site";
import { festivalEvents, getActiveEvent } from "@/data/events";
import { festivalArtists } from "@/data/artists";
import { festivalFaqs } from "@/data/faq";

export default function JsonLd() {
  const currentEvent = getActiveEvent();

  // 1. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    "name": siteConfig.name,
    "alternateName": ["No Limit Fest", "No Limit Festival", "No Limit Fest Dubai"],
    "url": siteConfig.url,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteConfig.url}/images/logo.png`,
      "width": "1024",
      "height": "1024",
      "caption": "No Limit Fest Official Logo",
    },
    "description": siteConfig.description,
    "email": siteConfig.email,
    "telephone": siteConfig.defaultWhatsApp,
    "sameAs": [
      siteConfig.socials.instagram,
      siteConfig.socials.tiktok,
      siteConfig.socials.twitter,
      siteConfig.socials.youtube,
      siteConfig.socials.spotify,
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": siteConfig.defaultWhatsApp,
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": ["AE", "QA", "OM", "BH", "SA", "GB", "US", "NG"],
        "availableLanguage": ["English", "Arabic"],
      },
      {
        "@type": "ContactPoint",
        "telephone": siteConfig.defaultWhatsApp,
        "contactType": "reservations",
        "contactOption": "HearingImpairedSupported",
        "areaServed": "AE",
        "availableLanguage": ["English", "Arabic"],
      },
    ],
  };

  // 2. MusicFestival Schema for Dubai Flagship Event (Google Rich Results standard)
  const festivalSchema = {
    "@context": "https://schema.org",
    "@type": "MusicFestival",
    "@id": `${siteConfig.url}/#festival-dubai-2026`,
    "name": "No Limit Fest Dubai 2026 | Ruger & Fido Live at Helipad by Frozen Cherry",
    "alternateName": "No Limit Fest Dubai Edition 01",
    "description": currentEvent.description,
    "url": `${siteConfig.url}/events/dubai`,
    "image": [
      `${siteConfig.url}/images/logo.png`,
      `${siteConfig.url}/images/artists/ruger.jpg`,
      `${siteConfig.url}/images/artists/fido.jpg`,
    ],
    "startDate": "2026-10-24T18:00:00+04:00",
    "endDate": "2026-10-25T04:00:00+04:00",
    "doorTime": "2026-10-24T17:30:00+04:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "maximumAttendeeCapacity": 5000,
    "typicalAgeRange": "21+",
    "isAccessibleForFree": false,
    "inLanguage": "en",
    "location": {
      "@type": "Place",
      "@id": `${siteConfig.url}/#venue-helipad`,
      "name": "Helipad by Frozen Cherry, Dubai",
      "hasMap": "https://maps.google.com/?q=Helipad+by+Frozen+Cherry+Dubai",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Helipad by Frozen Cherry, Dubai Festival City / Al Jaddaf Waterfront",
        "addressLocality": "Dubai",
        "addressRegion": "Dubai",
        "postalCode": "00000",
        "addressCountry": "AE",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.2048,
        "longitude": 55.2708,
      },
    },
    "organizer": [
      {
        "@type": "Organization",
        "name": "No Limit Fest Worldwide",
        "url": siteConfig.url,
      },
      {
        "@type": "Organization",
        "name": "Shurlaybor Empire",
        "url": siteConfig.url,
        "logo": `${siteConfig.url}/images/organizers/shurlaybor.png`,
      },
      {
        "@type": "Organization",
        "name": "Typical Naija",
        "url": siteConfig.url,
        "logo": `${siteConfig.url}/images/organizers/typical-naija.png`,
      },
    ],
    "performer": [
      {
        "@type": "Person",
        "name": "RUGER",
        "genre": "Afrobeats",
        "jobTitle": "Headliner",
        "image": `${siteConfig.url}/images/artists/ruger.jpg`,
        "sameAs": [
          "https://open.spotify.com/artist/05h1s39qL0tD2a3P6kHl7h",
          "https://www.instagram.com/rugerofficial",
        ],
      },
      {
        "@type": "Person",
        "name": "FIDO",
        "genre": "Afrobeats",
        "jobTitle": "Headliner",
        "image": `${siteConfig.url}/images/artists/fido.jpg`,
        "sameAs": [
          "https://open.spotify.com/artist/7zC8Y6sUqLp558B1dK7t51",
          "https://www.instagram.com/fidofidobaby",
        ],
      },
    ],
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "AED",
      "lowPrice": 295,
      "highPrice": 14500,
      "offerCount": 4,
      "availability": "https://schema.org/PreOrder",
      "validFrom": "2026-09-01T00:00:00+04:00",
      "url": `${siteConfig.url}/#events`,
      "offers": [
        {
          "@type": "Offer",
          "name": "Individual Pass",
          "price": "295",
          "priceCurrency": "AED",
          "availability": "https://schema.org/PreOrder",
          "validFrom": "2026-09-01T00:00:00+04:00",
          "url": `${siteConfig.url}/events/dubai`,
          "description": "General Admission access to Helipad by Frozen Cherry festival grounds and live headline performances by Ruger and Fido.",
        },
        {
          "@type": "Offer",
          "name": "VIP Table for 6",
          "price": "6500",
          "priceCurrency": "AED",
          "availability": "https://schema.org/PreOrder",
          "validFrom": "2026-09-01T00:00:00+04:00",
          "url": `${siteConfig.url}/events/dubai`,
          "description": "Reserved VIP elevated lounge table for 6 guests with beverage credit and fast-track VIP access.",
        },
        {
          "@type": "Offer",
          "name": "VIP Table for 8",
          "price": "9500",
          "priceCurrency": "AED",
          "availability": "https://schema.org/PreOrder",
          "validFrom": "2026-09-01T00:00:00+04:00",
          "url": `${siteConfig.url}/events/dubai`,
          "description": "Prime stage-view VIP table for 8 guests with top-shelf bottle package and dedicated hostess.",
        },
        {
          "@type": "Offer",
          "name": "VVIP Table for 10",
          "price": "14500",
          "priceCurrency": "AED",
          "availability": "https://schema.org/PreOrder",
          "validFrom": "2026-09-01T00:00:00+04:00",
          "url": `${siteConfig.url}/events/dubai`,
          "description": "Exclusive VVIP center-stage Helipad Cabana for 10 guests with personal butler service, backstage passes, and valet parking.",
        },
      ],
    },
  };

  // 3. FAQPage Schema for Google Rich Question/Answer snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    "mainEntity": festivalFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  // 4. WebSite Schema with Sitelinks SearchBox
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    "url": siteConfig.url,
    "name": "No Limit Fest",
    "description": siteConfig.description,
    "publisher": {
      "@id": `${siteConfig.url}/#organization`,
    },
    "inLanguage": "en",
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${siteConfig.url}/#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dubai Premiere 2026",
        "item": `${siteConfig.url}/events/dubai`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Lineup (Ruger & Fido)",
        "item": `${siteConfig.url}/lineup`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "VIP & Hospitality Tables",
        "item": `${siteConfig.url}/vip`,
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Global Tour Stops",
        "item": `${siteConfig.url}/events`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(festivalSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

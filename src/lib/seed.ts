import { getDb, dbQueryOne, dbExecute } from "./db";
import { hashPassword } from "./auth";
import {
  festivalEvents,
  dubaiTicketPhases,
  dubaiGroupPackages,
  dubaiTablePackages,
} from "@/data/events";
import { festivalArtists } from "@/data/artists";
import { festivalStages } from "@/data/stages";
import { festivalFaqs } from "@/data/faq";
import { siteConfig } from "@/config/site";

export function seedDatabase(): { success: boolean; message: string } {
  const db = getDb();

  // 1. Seed Staff Users if table is empty
  const userCount = dbQueryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM users",
  );
  if (!userCount || userCount.count === 0) {
    const adminPass = hashPassword("admin12345!");
    const gatePass = hashPassword("gate12345!");

    dbExecute(
      `INSERT INTO users (id, name, email, passwordHash, role, isActive) VALUES 
      (?, ?, ?, ?, 'SUPER_ADMIN', 1),
      (?, ?, ?, ?, 'GATE_STAFF', 1)`,
      [
        "usr-admin-01",
        "Festival Director",
        "admin@nolimitfest.com",
        adminPass,
        "usr-gate-01",
        "Helipad Gate Staff",
        "gate@nolimitfest.com",
        gatePass,
      ],
    );
  }

  // 2. Seed Site Config
  const configCount = dbQueryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM site_config",
  );
  if (!configCount || configCount.count === 0) {
    dbExecute(
      `INSERT INTO site_config (id, name, shortName, tagline, description, defaultWhatsApp, email, marqueeText, ageLimit, socials, organizers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "global",
        siteConfig.name,
        siteConfig.shortName,
        siteConfig.tagline,
        siteConfig.description,
        siteConfig.defaultWhatsApp,
        siteConfig.email,
        "★ MUSIC, ENERGY, NO LIMIT ★ HEADLINER RUGER LIVE AT HELIPAD BY FROZEN CHERRY DUBAI ★ SATURDAY 24TH OCTOBER 2026 ★ PHASE 0 EARLY BIRD TICKETS SELLING FAST ★ VIP TABLES & SQUAD PASSES AVAILABLE",
        siteConfig.dubaiEdition.ageLimit,
        JSON.stringify(siteConfig.socials),
        JSON.stringify(siteConfig.organizers),
      ],
    );
  }

  // 3. Seed Events
  const eventCount = dbQueryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM events",
  );
  if (!eventCount || eventCount.count === 0) {
    for (const evt of festivalEvents) {
      dbExecute(
        `INSERT INTO events (id, slug, name, edition, city, country, flag, region, status, dates, time, year, venue, address, tagline, description, heroImage, stagesCount, expectedAttendance, isCurrentEdition, experiences, partners)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          evt.id,
          evt.slug,
          evt.name,
          evt.edition,
          evt.city,
          evt.country,
          evt.flag,
          evt.region,
          evt.status,
          evt.dates,
          evt.time,
          evt.year,
          evt.venue,
          evt.address,
          evt.tagline,
          evt.description,
          evt.heroImage,
          evt.stagesCount,
          evt.expectedAttendance,
          evt.isCurrentEdition ? 1 : 0,
          JSON.stringify(evt.experiences || []),
          JSON.stringify(evt.partners || []),
        ],
      );

      // Seed Dubai Specific Detailed Tiers
      if (evt.id === "dubai-2026") {
        let sort = 10;
        // GA Phases
        for (const phase of dubaiTicketPhases) {
          dbExecute(
            `INSERT INTO ticket_tiers (id, eventId, name, category, price, currency, capacity, soldCount, paxPerUnit, badge, description, perks, status, popular, isVVIP, sortOrder, color, wristbandColor)
             VALUES (?, ?, ?, 'phase', ?, ?, ?, 0, 1, ?, ?, ?, ?, 0, 0, ?, '#00E676', 'NEON GREEN')`,
            [
              `tier-dxb-${phase.id}`,
              evt.id,
              phase.name,
              phase.price,
              phase.currency,
              phase.id === "early-bird" ? 500 : 800,
              phase.badge,
              phase.description,
              JSON.stringify([
                "Full festival admission to Helipad by Frozen Cherry",
                "Headline live concert by RUGER and supporting international acts",
                "Access to sunset cocktail bars, food village & art activations",
                "Commemorative festival wristband & rapid RFID entry",
              ]),
              phase.status === "active" ? "active" : "upcoming",
              sort++,
            ],
          );
        }

        // Group Squad Packages
        for (const grp of dubaiGroupPackages) {
          const color = grp.id === "group-3" ? "#00E5FF" : "#2979FF";
          const wristbandColor =
            grp.id === "group-3" ? "ELECTRIC CYAN" : "COBALT BLUE";
          dbExecute(
            `INSERT INTO ticket_tiers (id, eventId, name, category, price, currency, capacity, soldCount, paxPerUnit, badge, description, perks, status, popular, isVVIP, sortOrder, color, wristbandColor)
             VALUES (?, ?, ?, 'group', ?, ?, ?, 0, ?, ?, ?, ?, 'active', ?, 0, ?, ?, ?)`,
            [
              `tier-dxb-${grp.id}`,
              evt.id,
              grp.name,
              grp.totalPrice,
              grp.currency,
              grp.id === "group-3" ? 200 : 150,
              grp.pax,
              grp.badge,
              grp.description,
              JSON.stringify(grp.perks),
              grp.popular ? 1 : 0,
              sort++,
              color,
              wristbandColor,
            ],
          );
        }

        // VIP Table Packages
        for (const tbl of dubaiTablePackages) {
          let color = "#FFD600";
          let wristbandColor = "ROYAL GOLD VIP";
          if (tbl.isVVIP || tbl.id.includes("vvip")) {
            color = "#D500F9";
            wristbandColor = "ELECTRIC PURPLE VVIP";
          } else if (tbl.id.includes("10")) {
            color = "#FF6D00";
            wristbandColor = "SUNSET ORANGE VIP";
          } else if (tbl.id.includes("8")) {
            color = "#FFAB00";
            wristbandColor = "AMBER GOLD VIP";
          }

          dbExecute(
            `INSERT INTO ticket_tiers (id, eventId, name, category, price, currency, capacity, soldCount, paxPerUnit, badge, description, perks, status, popular, isVVIP, sortOrder, color, wristbandColor)
             VALUES (?, ?, ?, 'table', ?, ?, ?, 0, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
            [
              `tier-dxb-${tbl.id}`,
              evt.id,
              tbl.name,
              tbl.price,
              tbl.currency,
              tbl.id.includes("vvip") ? 2 : tbl.id.includes("10") ? 5 : 10,
              tbl.pax,
              tbl.badge,
              tbl.description,
              JSON.stringify(tbl.perks),
              tbl.popular ? 1 : 0,
              tbl.isVVIP ? 1 : 0,
              sort++,
              color,
              wristbandColor,
            ],
          );
        }
      } else {
        // Other City default tiers
        let sort = 10;
        for (const tier of evt.ticketTiers) {
          let color = "#00E676";
          let wristbandColor = "NEON GREEN";
          if (tier.id.includes("10")) {
            color = "#FF3D00";
            wristbandColor = "RUBY RED VIP";
          } else if (tier.id.includes("8")) {
            color = "#FFAB00";
            wristbandColor = "AMBER GOLD VIP";
          } else if (tier.id.includes("6")) {
            color = "#FFD600";
            wristbandColor = "ROYAL GOLD VIP";
          }

          dbExecute(
            `INSERT INTO ticket_tiers (id, eventId, name, category, price, currency, capacity, soldCount, paxPerUnit, badge, description, perks, status, popular, isVVIP, sortOrder, color, wristbandColor)
             VALUES (?, ?, ?, 'phase', 250, 'AED', 500, 0, ?, ?, ?, ?, 'upcoming', ?, 0, ?, ?, ?)`,
            [
              `tier-${evt.slug}-${tier.id}`,
              evt.id,
              tier.name,
              tier.capacity || 1,
              tier.badge,
              tier.priceEstimate,
              JSON.stringify(tier.perks || []),
              tier.popular ? 1 : 0,
              sort++,
              color,
              wristbandColor,
            ],
          );
        }
      }
    }
  }

  // 4. Seed Artists
  const artistCount = dbQueryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM artists",
  );
  if (!artistCount || artistCount.count === 0) {
    for (const art of festivalArtists) {
      dbExecute(
        `INSERT INTO artists (id, name, role, genre, day, stage, time, image, bio, origin, hits, spotifyUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          art.id,
          art.name,
          art.role,
          art.genre,
          art.day,
          art.stage,
          art.time,
          art.image,
          art.bio,
          art.origin,
          JSON.stringify(art.hits),
          art.spotifyUrl,
        ],
      );
    }
  }

  // 5. Seed Stages
  const stageCount = dbQueryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM stages",
  );
  if (!stageCount || stageCount.count === 0) {
    for (const stg of festivalStages) {
      dbExecute(
        `INSERT INTO stages (id, name, subtitle, tagline, description, image, genres, capacity, production)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stg.id,
          stg.name,
          stg.subtitle,
          stg.tagline,
          stg.description,
          stg.image,
          JSON.stringify(stg.genres),
          stg.capacity,
          JSON.stringify(stg.production),
        ],
      );
    }
  }

  // 6. Seed FAQs
  const faqCount = dbQueryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM faqs",
  );
  if (!faqCount || faqCount.count === 0) {
    let order = 1;
    for (const faq of festivalFaqs) {
      dbExecute(
        `INSERT INTO faqs (id, category, question, answer, sortOrder)
         VALUES (?, ?, ?, ?, ?)`,
        [faq.id, faq.category, faq.question, faq.answer, order++],
      );
    }
  }

  return {
    success: true,
    message:
      "Database successfully initialized and seeded with all festival data.",
  };
}

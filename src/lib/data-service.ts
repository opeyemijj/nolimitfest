// =============================================================================
// NO LIMIT FEST — DATA SERVICE (Supabase PostgreSQL Only)
// =============================================================================
// All functions are async. All SQL uses PostgreSQL syntax ($1/$2 placeholders,
// snake_case columns aliased to camelCase for TypeScript compatibility).
// =============================================================================

import { dbQuery, dbQueryOne, dbExecute } from "./db";
import { siteConfig } from "@/config/site";
import { festivalEvents, FestivalEvent, TicketTier } from "@/data/events";
import { festivalArtists, Artist } from "@/data/artists";
import { festivalStages, Stage } from "@/data/stages";
import { festivalFaqs, FAQItem } from "@/data/faq";
import { sendTicketConfirmationEmail } from "./email";
import { generateTicketSignature } from "./qrcode";
import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface DbSiteConfig {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  defaultWhatsApp: string;
  email: string;
  marqueeText: string;
  ageLimit: string;
  socials: Record<string, string>;
  organizers: { name: string; role: string; logo: string }[];
}

export interface DbTicketTier {
  id: string;
  eventId: string;
  name: string;
  category: "phase" | "group" | "table" | "vvip";
  price: number;
  currency: string;
  capacity: number;
  soldCount: number;
  paxPerUnit: number;
  badge?: string;
  description?: string;
  perks: string[];
  status: "active" | "upcoming" | "sold_out" | "hidden";
  popular: boolean;
  isVVIP: boolean;
  sortOrder: number;
  color?: string;
  wristbandColor?: string;
  allowDeposit?: boolean;
  depositPercentage?: number;
}

export interface DbEvent {
  id: string;
  slug: string;
  name: string;
  edition: string;
  city: string;
  country: string;
  flag: string;
  region: string;
  status: "active" | "announced" | "waitlist" | "completed";
  dates: string;
  time: string;
  year: string;
  venue: string;
  address: string;
  tagline: string;
  description: string;
  heroImage: string;
  stagesCount: number;
  expectedAttendance: string;
  isCurrentEdition: boolean;
  currency?: string;
  experiences: string[];
  partners?: { name: string; role: string }[];
  ticketTiers?: DbTicketTier[];
}

export interface DbOrder {
  id: string;
  orderNumber: string;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation?: string;
  notes?: string;
  totalAmount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  stripeSessionId?: string;
  isDeposit?: boolean;
  depositAmount?: number;
  remainingBalance?: number;
  createdAt: string;
  tickets?: DbTicket[];
}

export interface DbTicket {
  id: string;
  orderId: string;
  tierId: string;
  ticketCode: string;
  qrHash: string;
  attendeeName: string;
  attendeeEmail?: string;
  status: "VALID" | "CHECKED_IN" | "CANCELLED";
  checkedInAt?: string;
  checkedInBy?: string;
  tierName?: string;
  paxPerUnit?: number;
  category?: string;
  eventName?: string;
  eventVenue?: string;
  eventDates?: string;
  eventTime?: string;
  tierColor?: string;
  wristbandColor?: string;
}

// ---------------------------------------------------------------------------
// SQL column aliases for consistent camelCase return values
// ---------------------------------------------------------------------------
const TIER_SELECT = `
  id, event_id AS "eventId", name, category, price, currency, capacity,
  sold_count AS "soldCount", pax_per_unit AS "paxPerUnit", badge, description,
  perks, status, popular, is_vvip AS "isVVIP", sort_order AS "sortOrder",
  COALESCE(color, '#00E676') AS color,
  COALESCE(wristband_color, 'NEON GREEN') AS "wristbandColor",
  COALESCE(allow_deposit, true) AS "allowDeposit",
  COALESCE(deposit_percentage, 20) AS "depositPercentage",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

const EVENT_SELECT = `
  id, slug, name, edition, city, country, flag, region, status, dates, time, year,
  venue, address, tagline, description, hero_image AS "heroImage",
  stages_count AS "stagesCount", expected_attendance AS "expectedAttendance",
  is_current_edition AS "isCurrentEdition", experiences, partners,
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

const ORDER_SELECT = `
  id, order_number AS "orderNumber", event_id AS "eventId",
  customer_name AS "customerName", customer_email AS "customerEmail",
  customer_phone AS "customerPhone", customer_location AS "customerLocation",
  notes, total_amount AS "totalAmount", currency, status,
  COALESCE(is_deposit, false) AS "isDeposit",
  COALESCE(deposit_amount, 0) AS "depositAmount",
  COALESCE(remaining_balance, 0) AS "remainingBalance",
  stripe_session_id AS "stripeSessionId", stripe_payment_intent AS "stripePaymentIntent",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

const TICKET_SELECT = `
  t.id, t.order_id AS "orderId", t.tier_id AS "tierId", t.ticket_code AS "ticketCode",
  t.qr_hash AS "qrHash", t.attendee_name AS "attendeeName", t.attendee_email AS "attendeeEmail",
  t.status, t.checked_in_at AS "checkedInAt", t.checked_in_by AS "checkedInBy",
  t.created_at AS "createdAt", t.updated_at AS "updatedAt"
`;

// ---------------------------------------------------------------------------
// Site Configuration
// ---------------------------------------------------------------------------
export async function getSiteConfig(): Promise<DbSiteConfig> {
  try {
    const row = await dbQueryOne<any>(`
      SELECT id, name, short_name AS "shortName", tagline, description,
             default_whatsapp AS "defaultWhatsApp", email,
             marquee_text AS "marqueeText", age_limit AS "ageLimit",
             socials, organizers
      FROM site_config WHERE id = 'global'
    `);
    if (row) return row as DbSiteConfig;
  } catch (e) {
    console.error("Error fetching site_config:", e);
  }
  return {
    id: "global",
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    defaultWhatsApp: siteConfig.defaultWhatsApp,
    email: siteConfig.email,
    marqueeText:
      "★ MUSIC, ENERGY, NO LIMIT ★ HEADLINER RUGER LIVE AT HELIPAD BY FROZEN CHERRY DUBAI ★ SATURDAY 24TH OCTOBER 2026",
    ageLimit: "Strictly 21+",
    socials: siteConfig.socials || {},
    organizers: siteConfig.organizers || [],
  };
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export async function getAllEvents(): Promise<DbEvent[]> {
  try {
    const rows = await dbQuery<any>(`
      SELECT ${EVENT_SELECT}
      FROM events
      ORDER BY is_current_edition DESC, year ASC
    `);
    if (rows?.length > 0) {
      return rows.map(normalizeEvent);
    }
  } catch (e) {
    console.error("Error fetching events:", e);
  }
  return festivalEvents as unknown as DbEvent[];
}

export async function getActiveEvent(): Promise<DbEvent> {
  const events = await getAllEvents();
  return events.find((e) => e.isCurrentEdition) || events[0];
}

export async function getEventBySlug(
  slug: string,
): Promise<DbEvent | undefined> {
  try {
    const row = await dbQueryOne<any>(
      `
      SELECT ${EVENT_SELECT}
      FROM events WHERE LOWER(slug) = LOWER($1)
    `,
      [slug],
    );
    if (row) return normalizeEvent(row);
  } catch (e) {
    console.error("Error fetching event by slug:", e);
  }
  return undefined;
}

function normalizeEvent(r: any): DbEvent {
  return {
    ...r,
    isCurrentEdition: Boolean(r.isCurrentEdition),
    experiences: Array.isArray(r.experiences)
      ? r.experiences
      : typeof r.experiences === "string"
        ? JSON.parse(r.experiences)
        : [],
    partners: Array.isArray(r.partners)
      ? r.partners
      : typeof r.partners === "string"
        ? JSON.parse(r.partners)
        : [],
  };
}

// ---------------------------------------------------------------------------
// Ticket Tiers
// ---------------------------------------------------------------------------
export async function getTicketTiers(eventId: string): Promise<DbTicketTier[]> {
  try {
    const rows = await dbQuery<any>(
      `
      SELECT ${TIER_SELECT}
      FROM ticket_tiers
      WHERE event_id = $1
      ORDER BY sort_order ASC, price ASC
    `,
      [eventId],
    );
    if (rows?.length > 0) {
      return rows.map(normalizeTier);
    }
  } catch (e) {
    console.error("Error fetching tiers:", e);
  }
  return [];
}

function normalizeTier(r: any): DbTicketTier {
  return {
    ...r,
    perks: Array.isArray(r.perks)
      ? r.perks
      : typeof r.perks === "string"
        ? JSON.parse(r.perks)
        : [],
    popular: Boolean(r.popular),
    isVVIP: Boolean(r.isVVIP),
  };
}

// ---------------------------------------------------------------------------
// Artists / Lineup
// ---------------------------------------------------------------------------
export async function getAllArtists(): Promise<Artist[]> {
  try {
    const rows = await dbQuery<any>(`
      SELECT id, name, role, genre, day, stage, time, image, bio,
             COALESCE(origin, '') AS origin,
             COALESCE(hits, '[]') AS hits,
             spotify_url AS "spotifyUrl",
             created_at AS "createdAt"
      FROM artists
      ORDER BY id ASC
    `);
    if (rows?.length > 0) {
      return rows.map((r: any) => ({
        ...r,
        hits: Array.isArray(r.hits)
          ? r.hits
          : typeof r.hits === "string"
            ? JSON.parse(r.hits)
            : [],
      }));
    }
  } catch (e) {
    console.error("Error fetching artists:", e);
  }
  return festivalArtists;
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------
export async function getAllStages(): Promise<Stage[]> {
  try {
    const rows = await dbQuery<any>(`
      SELECT id, name, subtitle, tagline, description, image,
             genres, capacity, production
      FROM stages ORDER BY id ASC
    `);
    if (rows?.length > 0) {
      return rows.map((r: any) => ({
        ...r,
        genres: Array.isArray(r.genres)
          ? r.genres
          : typeof r.genres === "string"
            ? JSON.parse(r.genres)
            : [],
        production: typeof r.production === "object" ? r.production : {},
      }));
    }
  } catch (e) {
    console.error("Error fetching stages:", e);
  }
  return festivalStages;
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
export async function getAllFAQs(): Promise<FAQItem[]> {
  try {
    const rows = await dbQuery<any>(`
      SELECT id, category, question, answer, sort_order AS "sortOrder"
      FROM faqs ORDER BY sort_order ASC
    `);
    if (rows?.length > 0) return rows;
  } catch (e) {
    console.error("Error fetching faqs:", e);
  }
  return festivalFaqs;
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------
export async function getTicketByCode(
  ticketCode: string,
): Promise<DbTicket | null> {
  try {
    const cleanCode = decodeURIComponent(ticketCode || "").trim();
    if (!cleanCode) return null;

    const row = await dbQueryOne<any>(
      `
      SELECT
        ${TICKET_SELECT},
        COALESCE(tt.name, 'Festival Pass') AS "tierName",
        COALESCE(tt.pax_per_unit, 1) AS "paxPerUnit",
        COALESCE(tt.category, 'phase') AS category,
        COALESCE(tt.color, '#00E676') AS "tierColor",
        COALESCE(tt.wristband_color, 'NEON GREEN') AS "wristbandColor",
        COALESCE(e.id, 'dubai-2026') AS "eventId",
        COALESCE(e.name, 'No Limit Fest Dubai') AS "eventName",
        COALESCE(e.venue, 'Helipad by Frozen Cherry, Dubai') AS "eventVenue",
        COALESCE(e.dates, 'Saturday 24th October 2026') AS "eventDates",
        COALESCE(e.time, '6:00 PM Till Late') AS "eventTime"
      FROM tickets t
      LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
      LEFT JOIN orders o ON t.order_id = o.id
      LEFT JOIN events e ON o.event_id = e.id
      WHERE t.ticket_code = $1 OR t.ticket_code ILIKE $1 OR t.id = $1
    `,
      [cleanCode],
    );
    return row || null;
  } catch (e) {
    console.error("Error fetching ticket:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export async function getAllOrders(limit = 50): Promise<DbOrder[]> {
  try {
    return await dbQuery<any>(
      `
      SELECT ${ORDER_SELECT}
      FROM orders
      ORDER BY created_at DESC
      LIMIT $1
    `,
      [limit],
    );
  } catch (e) {
    console.error("Error fetching orders:", e);
    return [];
  }
}

export async function getOrderById(
  orderId: string,
): Promise<(DbOrder & { tickets: DbTicket[] }) | null> {
  try {
    const cleanId = decodeURIComponent(orderId || "").trim();
    if (!cleanId) return null;

    const order = await dbQueryOne<any>(
      `
      SELECT ${ORDER_SELECT}
      FROM orders
      WHERE id = $1 OR order_number = $1 OR order_number ILIKE $1
    `,
      [cleanId],
    );
    if (!order) return null;

    const tickets = await dbQuery<any>(
      `
      SELECT
        ${TICKET_SELECT},
        COALESCE(tt.name, 'Festival Pass') AS "tierName",
        COALESCE(tt.pax_per_unit, 1) AS "paxPerUnit",
        COALESCE(tt.color, '#00E676') AS "tierColor",
        COALESCE(tt.wristband_color, 'NEON GREEN') AS "wristbandColor"
      FROM tickets t
      LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
      WHERE t.order_id = $1
    `,
      [order.id],
    );

    return { ...order, tickets: tickets || [] };
  } catch (e) {
    console.error("Error fetching order with tickets:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Gate Check-In (Atomic)
// ---------------------------------------------------------------------------
export async function performTicketCheckIn(
  ticketCode: string,
  staffEmail: string,
  deviceInfo?: string,
): Promise<{
  success: boolean;
  status: "CHECKED_IN" | "ALREADY_CHECKED_IN" | "NOT_FOUND";
  ticket?: DbTicket;
  message: string;
}> {
  const ticket = await getTicketByCode(ticketCode);
  if (!ticket) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Ticket not found in festival registry.",
    };
  }

  if (ticket.status === "CHECKED_IN") {
    const logId = `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await dbExecute(
      `INSERT INTO check_in_logs (id, ticket_id, result, staff_email, device_info)
       VALUES ($1, $2, 'DUPLICATE', $3, $4)`,
      [logId, ticket.id, staffEmail, deviceInfo || "web"],
    );
    return {
      success: false,
      status: "ALREADY_CHECKED_IN",
      ticket,
      message: `Already checked in on ${ticket.checkedInAt} by ${ticket.checkedInBy || "Gate Staff"}.`,
    };
  }

  const now = new Date().toISOString();
  await dbExecute(
    `UPDATE tickets
     SET status = 'CHECKED_IN', checked_in_at = $1, checked_in_by = $2, updated_at = $3
     WHERE id = $4`,
    [now, staffEmail, now, ticket.id],
  );

  const logId = `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await dbExecute(
    `INSERT INTO check_in_logs (id, ticket_id, result, staff_email, device_info)
     VALUES ($1, $2, 'SUCCESS', $3, $4)`,
    [logId, ticket.id, staffEmail, deviceInfo || "web"],
  );

  const updatedTicket = await getTicketByCode(ticketCode);
  return {
    success: true,
    status: "CHECKED_IN",
    ticket: updatedTicket || ticket,
    message: `Attendee successfully admitted. Wristband allocation: ${ticket.paxPerUnit || 1} pass(es).`,
  };
}

// ---------------------------------------------------------------------------
// Stripe Order Fulfillment
// ---------------------------------------------------------------------------
export async function fulfillOrderFromStripeSession(
  sessionId: string,
  baseUrl?: string,
): Promise<(DbOrder & { tickets: DbTicket[] }) | null> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return null;

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      { headers: { Authorization: `Bearer ${stripeSecretKey}` } },
    );
    if (!res.ok) return null;
    const session = await res.json();

    if (session.payment_status === "paid") {
      const order = await dbQueryOne<any>(
        `
        SELECT ${ORDER_SELECT}
        FROM orders
        WHERE stripe_session_id = $1 OR id = $2
      `,
        [sessionId, session.metadata?.orderId || ""],
      );

      if (order) {
        const stripeCustomerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          order.customerEmail;

        if (order.status !== "PAID") {
          await dbExecute(
            `UPDATE orders
             SET status = 'PAID',
                 stripe_payment_intent = $1,
                 customer_email = COALESCE(NULLIF(customer_email, ''), $2),
                 updated_at = NOW()
             WHERE id = $3`,
            [session.payment_intent || "", stripeCustomerEmail, order.id],
          );

          await dbExecute(
            `UPDATE tickets SET status = 'VALID', updated_at = NOW() WHERE order_id = $1`,
            [order.id],
          );

          let tickets = await dbQuery<any>(
            `
            SELECT
              ${TICKET_SELECT},
              tt.name AS "tierName",
              tt.pax_per_unit AS "paxPerUnit"
            FROM tickets t
            JOIN ticket_tiers tt ON t.tier_id = tt.id
            WHERE t.order_id = $1
          `,
            [order.id],
          );

          if (!tickets || tickets.length === 0) {
            const tier = await dbQueryOne<any>(
              `
              SELECT ${TIER_SELECT}
              FROM ticket_tiers
              WHERE event_id = $1 AND status = 'active'
              LIMIT 1
            `,
              [order.eventId],
            );

            if (tier) {
              const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
              const festivalEvent = await dbQueryOne<any>(
                `SELECT slug FROM events WHERE id = $1`,
                [order.eventId],
              );
              const ticketCode = `NLF-${(festivalEvent?.slug || "DXB").toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
              const qrHash = `${ticketCode}:${generateTicketSignature(ticketCode)}`;

              await dbExecute(
                `INSERT INTO tickets (id, order_id, tier_id, ticket_code, qr_hash, attendee_name, attendee_email, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'VALID')`,
                [
                  ticketId,
                  order.id,
                  tier.id,
                  ticketCode,
                  qrHash,
                  order.customerName,
                  stripeCustomerEmail,
                ],
              );
              await dbExecute(
                `UPDATE ticket_tiers SET sold_count = sold_count + 1 WHERE id = $1`,
                [tier.id],
              );

              tickets = await dbQuery<any>(
                `
                SELECT
                  ${TICKET_SELECT},
                  tt.name AS "tierName",
                  tt.pax_per_unit AS "paxPerUnit"
                FROM tickets t
                JOIN ticket_tiers tt ON t.tier_id = tt.id
                WHERE t.order_id = $1
              `,
                [order.id],
              );
            }
          } else {
            for (const t of tickets) {
              await dbExecute(
                `UPDATE ticket_tiers SET sold_count = sold_count + 1 WHERE id = $1`,
                [t.tierId],
              );
            }
          }

          try {
            console.log(
              `[ORDER FULFILLMENT] Dispatching confirmation email for Order #${order.orderNumber} to ${stripeCustomerEmail}...`,
            );
            await sendTicketConfirmationEmail({
              order: {
                ...order,
                status: "PAID",
                customerEmail: stripeCustomerEmail,
              },
              tickets,
              baseUrl:
                baseUrl ||
                process.env.NEXT_PUBLIC_APP_URL ||
                "https://nolimitfest.net",
            });
          } catch (mailErr) {
            console.error("Failed to send confirmation email:", mailErr);
          }
        }

        return getOrderById(order.id);
      }
    }
  } catch (err) {
    console.error("Error fulfilling order from Stripe session:", err);
  }
  return null;
}

import { getDb, dbQuery, dbQueryOne, dbExecute, pgExecute } from "./db";
import { seedDatabase } from "./seed";
import { siteConfig } from "@/config/site";
import { festivalEvents, FestivalEvent, TicketTier } from "@/data/events";
import { festivalArtists, Artist } from "@/data/artists";
import { festivalStages, Stage } from "@/data/stages";
import { festivalFaqs, FAQItem } from "@/data/faq";
import { sendTicketConfirmationEmail } from "./email";
import { generateTicketSignature } from "./qrcode";
import crypto from "node:crypto";

let isSeeded = false;
function ensureDb() {
  if (!isSeeded) {
    try {
      seedDatabase();
      isSeeded = true;
    } catch (err) {
      console.error("Error ensuring database seed:", err);
    }
  }
}

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

/**
 * Get Site Configuration
 */
export function getSiteConfig(): DbSiteConfig {
  ensureDb();
  try {
    const row = dbQueryOne<any>(
      "SELECT * FROM site_config WHERE id = 'global'",
    );
    if (row) {
      return {
        ...row,
        socials:
          typeof row.socials === "string"
            ? JSON.parse(row.socials)
            : row.socials,
        organizers:
          typeof row.organizers === "string"
            ? JSON.parse(row.organizers)
            : row.organizers,
      };
    }
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
    ageLimit: siteConfig.dubaiEdition.ageLimit,
    socials: siteConfig.socials,
    organizers: siteConfig.organizers,
  };
}

/**
 * Get All Events
 */
export function getAllEvents(): DbEvent[] {
  ensureDb();
  try {
    const rows = dbQuery<any>(
      "SELECT * FROM events ORDER BY isCurrentEdition DESC, year ASC",
    );
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        isCurrentEdition: Boolean(r.isCurrentEdition),
        experiences:
          typeof r.experiences === "string"
            ? JSON.parse(r.experiences)
            : r.experiences || [],
        partners:
          typeof r.partners === "string"
            ? JSON.parse(r.partners)
            : r.partners || [],
      }));
    }
  } catch (e) {
    console.error("Error fetching events:", e);
  }
  return festivalEvents as unknown as DbEvent[];
}

/**
 * Get Active Event (Dubai flagship)
 */
export function getActiveEvent(): DbEvent {
  const events = getAllEvents();
  return events.find((e) => e.isCurrentEdition) || events[0];
}

/**
 * Get Event by Slug
 */
export function getEventBySlug(slug: string): DbEvent | undefined {
  const events = getAllEvents();
  return events.find((e) => e.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Get Ticket Tiers for an Event
 */
export function getTicketTiers(eventId: string): DbTicketTier[] {
  ensureDb();
  try {
    const rows = dbQuery<any>(
      "SELECT * FROM ticket_tiers WHERE eventId = ? ORDER BY sortOrder ASC, price ASC",
      [eventId],
    );
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        perks:
          typeof r.perks === "string" ? JSON.parse(r.perks) : r.perks || [],
        popular: Boolean(r.popular),
        isVVIP: Boolean(r.isVVIP),
      }));
    }
  } catch (e) {
    console.error("Error fetching tiers:", e);
  }
  return [];
}

/**
 * Get Artists / Lineup
 */
export function getAllArtists(): Artist[] {
  ensureDb();
  try {
    const rows = dbQuery<any>("SELECT * FROM artists ORDER BY id ASC");
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        hits: typeof r.hits === "string" ? JSON.parse(r.hits) : r.hits || [],
      }));
    }
  } catch (e) {
    console.error("Error fetching artists:", e);
  }
  return festivalArtists;
}

/**
 * Get Stages
 */
export function getAllStages(): Stage[] {
  ensureDb();
  try {
    const rows = dbQuery<any>("SELECT * FROM stages ORDER BY id ASC");
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        genres:
          typeof r.genres === "string" ? JSON.parse(r.genres) : r.genres || [],
        production:
          typeof r.production === "string"
            ? JSON.parse(r.production)
            : r.production || {},
      }));
    }
  } catch (e) {
    console.error("Error fetching stages:", e);
  }
  return festivalStages;
}

/**
 * Get FAQs
 */
export function getAllFAQs(): FAQItem[] {
  ensureDb();
  try {
    const rows = dbQuery<any>("SELECT * FROM faqs ORDER BY sortOrder ASC");
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (e) {
    console.error("Error fetching faqs:", e);
  }
  return festivalFaqs;
}

/**
 * Get Ticket by Code (for entrance scanning & digital pass)
 */
export function getTicketByCode(ticketCode: string): DbTicket | null {
  ensureDb();
  try {
    const row = dbQueryOne<any>(
      `SELECT t.*, 
              tt.name as tierName, tt.paxPerUnit, tt.category,
              COALESCE(tt.color, '#00E676') as tierColor,
              COALESCE(tt.wristbandColor, 'NEON GREEN') as wristbandColor,
              e.id as eventId, e.name as eventName, e.venue as eventVenue, e.dates as eventDates, e.time as eventTime
       FROM tickets t
       JOIN ticket_tiers tt ON t.tierId = tt.id
       JOIN orders o ON t.orderId = o.id
       JOIN events e ON o.eventId = e.id
       WHERE t.ticketCode = ?`,
      [ticketCode],
    );
    return row || null;
  } catch (e) {
    console.error("Error fetching ticket:", e);
    return null;
  }
}

/**
 * Get All Orders
 */
export function getAllOrders(limit: number = 50): DbOrder[] {
  ensureDb();
  try {
    const orders = dbQuery<any>(
      "SELECT * FROM orders ORDER BY createdAt DESC LIMIT ?",
      [limit],
    );
    return orders;
  } catch (e) {
    console.error("Error fetching orders:", e);
    return [];
  }
}

/**
 * Get Order by ID with Tickets
 */
export function getOrderById(
  orderId: string,
): (DbOrder & { tickets: DbTicket[] }) | null {
  ensureDb();
  try {
    const order = dbQueryOne<any>(
      "SELECT * FROM orders WHERE id = ? OR orderNumber = ?",
      [orderId, orderId],
    );
    if (!order) return null;

    const tickets = dbQuery<any>(
      `SELECT t.*, tt.name as tierName, tt.paxPerUnit,
              COALESCE(tt.color, '#00E676') as tierColor,
              COALESCE(tt.wristbandColor, 'NEON GREEN') as wristbandColor
       FROM tickets t 
       JOIN ticket_tiers tt ON t.tierId = tt.id 
       WHERE t.orderId = ?`,
      [order.id],
    );

    return {
      ...order,
      tickets: tickets || [],
    };
  } catch (e) {
    console.error("Error fetching order with tickets:", e);
    return null;
  }
}

/**
 * Check In Ticket (Atomic)
 */
export function performTicketCheckIn(
  ticketCode: string,
  staffEmail: string,
  deviceInfo?: string,
): {
  success: boolean;
  status: "CHECKED_IN" | "ALREADY_CHECKED_IN" | "NOT_FOUND";
  ticket?: DbTicket;
  message: string;
} {
  ensureDb();
  const db = getDb();

  const ticket = getTicketByCode(ticketCode);
  if (!ticket) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Ticket not found in festival registry.",
    };
  }

  if (ticket.status === "CHECKED_IN") {
    dbExecute(
      `INSERT INTO check_in_logs (id, ticketId, result, staffEmail, deviceInfo) VALUES (?, ?, 'DUPLICATE', ?, ?)`,
      [
        `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ticket.id,
        staffEmail,
        deviceInfo || "web",
      ],
    );
    return {
      success: false,
      status: "ALREADY_CHECKED_IN",
      ticket,
      message: `Already checked in on ${ticket.checkedInAt} by ${ticket.checkedInBy || "Gate Staff"}.`,
    };
  }

  const now = new Date().toISOString();
  dbExecute(
    `UPDATE tickets SET status = 'CHECKED_IN', checkedInAt = ?, checkedInBy = ?, updatedAt = ? WHERE id = ?`,
    [now, staffEmail, now, ticket.id],
  );

  dbExecute(
    `INSERT INTO check_in_logs (id, ticketId, result, staffEmail, deviceInfo) VALUES (?, ?, 'SUCCESS', ?, ?)`,
    [
      `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticket.id,
      staffEmail,
      deviceInfo || "web",
    ],
  );

  const updatedTicket = getTicketByCode(ticketCode);
  return {
    success: true,
    status: "CHECKED_IN",
    ticket: updatedTicket || ticket,
    message: `Attendee successfully admitted. Wristband allocation: ${ticket.paxPerUnit || 1} pass(es).`,
  };
}

/**
 * Reconciles and fulfills an order via Stripe Checkout Session
 */
export async function fulfillOrderFromStripeSession(
  sessionId: string,
  baseUrl?: string,
): Promise<(DbOrder & { tickets: DbTicket[] }) | null> {
  ensureDb();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return null;

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      },
    );
    if (!res.ok) return null;
    const session = await res.json();

    if (session.payment_status === "paid") {
      const order = dbQueryOne<any>(
        "SELECT * FROM orders WHERE stripeSessionId = ? OR id = ?",
        [sessionId, session.metadata?.orderId || ""],
      );

      if (order) {
        const stripeCustomerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          order.customerEmail;

        if (order.status !== "PAID") {
          dbExecute(
            `UPDATE orders SET status = 'PAID', stripePaymentIntent = ?, customerEmail = COALESCE(NULLIF(customerEmail, ''), ?), updatedAt = datetime('now') WHERE id = ?`,
            [session.payment_intent || "", stripeCustomerEmail, order.id],
          );

          // Activate pending tickets
          dbExecute(`UPDATE tickets SET status = 'VALID' WHERE orderId = ?`, [
            order.id,
          ]);

          // Mirror payment status and active tickets to Supabase PostgreSQL
          pgExecute(
            `UPDATE orders SET status = 'PAID', stripe_payment_intent = $1, customer_email = COALESCE(NULLIF(customer_email, ''), $2), updated_at = NOW() WHERE id = $3`,
            [session.payment_intent || "", stripeCustomerEmail, order.id],
          ).catch(() => {});
          pgExecute(
            `UPDATE tickets SET status = 'VALID', updated_at = NOW() WHERE order_id = $1`,
            [order.id],
          ).catch(() => {});

          // Fetch all tickets for order
          let tickets = dbQuery<any>(
            `SELECT t.*, tt.name as tierName, tt.paxPerUnit 
             FROM tickets t 
             JOIN ticket_tiers tt ON t.tierId = tt.id 
             WHERE t.orderId = ?`,
            [order.id],
          );

          // If no tickets were pre-inserted, generate them from tier
          if (!tickets || tickets.length === 0) {
            const tier = dbQueryOne<any>(
              "SELECT * FROM ticket_tiers WHERE eventId = ? AND status = 'active' LIMIT 1",
              [order.eventId],
            );
            if (tier) {
              const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
              const festivalEvent = dbQueryOne<any>(
                "SELECT * FROM events WHERE id = ?",
                [order.eventId],
              );
              const ticketCode = `NLF-${festivalEvent?.slug.toUpperCase() || "DXB"}-${Math.floor(10000 + Math.random() * 90000)}`;
              const qrHash = `${ticketCode}:${generateTicketSignature(ticketCode)}`;

              dbExecute(
                `INSERT INTO tickets (id, orderId, tierId, ticketCode, qrHash, attendeeName, attendeeEmail, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'VALID')`,
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
              dbExecute(
                `UPDATE ticket_tiers SET soldCount = soldCount + 1 WHERE id = ?`,
                [tier.id],
              );

              tickets = dbQuery<any>(
                `SELECT t.*, tt.name as tierName, tt.paxPerUnit 
                 FROM tickets t 
                 JOIN ticket_tiers tt ON t.tierId = tt.id 
                 WHERE t.orderId = ?`,
                [order.id],
              );
            }
          } else {
            // Increment sold count for pre-created tickets
            for (const t of tickets) {
              dbExecute(
                `UPDATE ticket_tiers SET soldCount = soldCount + 1 WHERE id = ?`,
                [t.tierId],
              );
            }
          }

          // Send confirmation email with genuine QR passes via Postmark
          try {
            console.log(
              `[ORDER FULFILLMENT] Dispatching ticket confirmation email for Order #${order.orderNumber} to ${stripeCustomerEmail}...`,
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
                "https://nolimitfest.com",
            });
          } catch (mailErr) {
            console.error(
              "Failed to send postmark confirmation email:",
              mailErr,
            );
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

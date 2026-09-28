// =============================================================================
// NO LIMIT FEST — TICKET & ORDER VALIDATION UTILITIES
// =============================================================================
// Pure client & server safe functions (no Node.js/pg/db dependencies).
// Ensures strict enforcement: only paid and complementary tickets are confirmed
// and have active digital entry passes.
// =============================================================================

export interface DbTicket {
  id: string;
  orderId: string;
  tierId: string;
  ticketCode: string;
  qrHash: string;
  attendeeName: string;
  attendeeEmail?: string;
  status:
    | "VALID"
    | "CHECKED_IN"
    | "CANCELLED"
    | "PENDING"
    | "COMPLIMENTARY"
    | "COMPLEMENTARY"
    | string;
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
  orderStatus?: string;
  orderNumber?: string;
  orderTotalAmount?: number;
  orderNotes?: string;
}

/**
 * Returns true if an order is complimentary (or complementary / comp pass)
 */
export function isOrderComplimentary(order?: {
  status?: string;
  orderNumber?: string;
  notes?: string;
  totalAmount?: number;
} | null): boolean {
  if (!order) return false;
  const statusUpper = (order.status || "").toUpperCase();
  if (statusUpper === "COMPLIMENTARY" || statusUpper === "COMPLEMENTARY") {
    return true;
  }
  if ((order.orderNumber || "").toUpperCase().startsWith("COMP-")) {
    return true;
  }
  if (
    Number(order.totalAmount || 0) === 0 &&
    (order.notes?.toLowerCase().includes("complimentary") ||
      order.notes?.toLowerCase().includes("complementary") ||
      order.notes?.toLowerCase().includes("comp pass"))
  ) {
    return true;
  }
  return false;
}

/**
 * Returns true only if an order is confirmed (PAID or COMPLIMENTARY/COMPLEMENTARY)
 */
export function isOrderConfirmed(order?: {
  status?: string;
  orderNumber?: string;
  notes?: string;
  totalAmount?: number;
} | null): boolean {
  if (!order) return false;
  const statusUpper = (order.status || "").toUpperCase();
  if (statusUpper === "PAID") return true;
  return isOrderComplimentary(order);
}

/**
 * Returns true if a ticket is complimentary (or complementary / guestlist)
 */
export function isTicketComplimentary(ticket?: {
  ticketCode?: string;
  status?: string;
  orderStatus?: string;
  orderNumber?: string;
  tierName?: string;
  attendeeName?: string;
  orderNotes?: string;
} | null): boolean {
  if (!ticket) return false;
  if ((ticket.ticketCode || "").toUpperCase().startsWith("COMP-")) return true;
  if ((ticket.orderNumber || "").toUpperCase().startsWith("COMP-")) return true;
  const statusUpper = (ticket.status || "").toUpperCase();
  if (statusUpper === "COMPLIMENTARY" || statusUpper === "COMPLEMENTARY") {
    return true;
  }
  const ordStatusUpper = (ticket.orderStatus || "").toUpperCase();
  if (ordStatusUpper === "COMPLIMENTARY" || ordStatusUpper === "COMPLEMENTARY") {
    return true;
  }
  if (
    (ticket.tierName || "").toLowerCase().includes("complimentary") ||
    (ticket.tierName || "").toLowerCase().includes("complementary")
  ) {
    return true;
  }
  if (
    (ticket.attendeeName || "").toLowerCase().includes("(comp") ||
    (ticket.orderNotes || "").toLowerCase().includes("complimentary") ||
    (ticket.orderNotes || "").toLowerCase().includes("complementary")
  ) {
    return true;
  }
  return false;
}

/**
 * Returns true only if a ticket is confirmed and has a valid pass:
 * 1. Must be PAID or COMPLIMENTARY (or COMPLEMENTARY)
 * 2. Ticket status must be VALID, CHECKED_IN, or COMPLIMENTARY
 * 3. Never PENDING, CANCELLED, REFUNDED, or UNPAID
 */
export function isTicketConfirmedAndValid(ticket?: {
  status?: string;
  ticketCode?: string;
  orderStatus?: string;
  orderNumber?: string;
  tierName?: string;
  attendeeName?: string;
  orderNotes?: string;
} | null): boolean {
  if (!ticket) return false;
  const statusUpper = (ticket.status || "").toUpperCase();

  // Cancelled or pending ticket status is always invalid
  if (
    statusUpper === "CANCELLED" ||
    statusUpper === "PENDING" ||
    statusUpper === "REFUNDED"
  ) {
    return false;
  }

  // Must be VALID, already CHECKED_IN, or COMPLIMENTARY
  if (
    statusUpper !== "VALID" &&
    statusUpper !== "CHECKED_IN" &&
    statusUpper !== "COMPLIMENTARY" &&
    statusUpper !== "COMPLEMENTARY"
  ) {
    return false;
  }

  // If the ticket is complementary, it is confirmed
  if (isTicketComplimentary(ticket)) {
    return true;
  }

  // If associated with an order, order must be confirmed (PAID or COMPLIMENTARY)
  if (ticket.orderStatus) {
    const ordStatusUpper = ticket.orderStatus.toUpperCase();
    if (
      ordStatusUpper !== "PAID" &&
      ordStatusUpper !== "COMPLIMENTARY" &&
      ordStatusUpper !== "COMPLEMENTARY"
    ) {
      return false;
    }
  }

  return true;
}

import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne, dbExecute, dbQuery } from "@/lib/db";
import { generateTicketSignature } from "@/lib/qrcode";
import { sendTicketConfirmationEmail } from "@/lib/email";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: any;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      // Verify signature manually
      // Parse header: t=...,v1=...
      const elements = signature.split(",").reduce((acc: any, part) => {
        const [k, v] = part.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const timestamp = elements["t"];
      const v1 = elements["v1"];
      const signedPayload = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");

      if (v1 !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid Stripe webhook signature." },
          { status: 400 },
        );
      }

      event = JSON.parse(rawBody);
    } else {
      event = JSON.parse(rawBody);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const sessionId = session?.id;

      if (!sessionId) {
        return NextResponse.json(
          { error: "Missing session ID in webhook." },
          { status: 400 },
        );
      }

      const order = await dbQueryOne<any>(
        `SELECT
           id,
           order_number        AS "orderNumber",
           event_id            AS "eventId",
           customer_name       AS "customerName",
           customer_email      AS "customerEmail",
           customer_phone      AS "customerPhone",
           customer_location   AS "customerLocation",
           notes,
           total_amount        AS "totalAmount",
           currency,
           status,
           stripe_session_id   AS "stripeSessionId",
           created_at          AS "createdAt"
         FROM orders
         WHERE stripe_session_id = $1`,
        [sessionId],
      );

      if (order && order.status !== "PAID") {
        // Mark order as PAID
        await dbExecute(
          `UPDATE orders
           SET status = 'PAID',
               stripe_payment_intent = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [session.payment_intent || "", order.id],
        );

        // Fetch order's event
        const festivalEvent = await dbQueryOne<any>(
          "SELECT * FROM events WHERE id = $1",
          [order.eventId],
        );

        // Activate existing pending tickets or generate new if none
        const existingTickets = await dbQuery<any>(
          `SELECT
             id,
             order_id      AS "orderId",
             tier_id       AS "tierId",
             ticket_code   AS "ticketCode",
             qr_hash       AS "qrHash",
             attendee_name AS "attendeeName",
             attendee_email AS "attendeeEmail",
             status,
             created_at    AS "createdAt"
           FROM tickets
           WHERE order_id = $1`,
          [order.id],
        );

        if (existingTickets.length > 0) {
          await dbExecute(
            `UPDATE tickets SET status = 'VALID' WHERE order_id = $1`,
            [order.id],
          );

          for (const t of existingTickets) {
            await dbExecute(
              `UPDATE ticket_tiers SET sold_count = sold_count + 1 WHERE id = $1`,
              [t.tierId],
            );
          }

          const activatedTickets = await dbQuery<any>(
            `SELECT
               t.id,
               t.order_id      AS "orderId",
               t.tier_id       AS "tierId",
               t.ticket_code   AS "ticketCode",
               t.qr_hash       AS "qrHash",
               t.attendee_name AS "attendeeName",
               t.attendee_email AS "attendeeEmail",
               t.status,
               tt.name         AS "tierName",
               tt.pax_per_unit AS "paxPerUnit"
             FROM tickets t
             JOIN ticket_tiers tt ON t.tier_id = tt.id
             WHERE t.order_id = $1`,
            [order.id],
          );

          await sendTicketConfirmationEmail({
            order: { ...order, status: "PAID" },
            tickets: activatedTickets,
          });
        } else {
          // If no tickets were pre-created, generate a pass from the active tier
          const tier = await dbQueryOne<any>(
            `SELECT
               id,
               event_id        AS "eventId",
               name,
               category,
               price,
               currency,
               capacity,
               sold_count      AS "soldCount",
               pax_per_unit    AS "paxPerUnit",
               wristband_color AS "wristbandColor",
               status
             FROM ticket_tiers
             WHERE event_id = $1 AND status = 'active'
             LIMIT 1`,
            [order.eventId],
          );

          if (tier) {
            const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
            const ticketCode = `NLF-${festivalEvent?.slug.toUpperCase() || "DXB"}-${Math.floor(10000 + Math.random() * 90000)}`;
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
                order.customerEmail,
              ],
            );

            // Increment sold count
            await dbExecute(
              `UPDATE ticket_tiers SET sold_count = sold_count + 1 WHERE id = $1`,
              [tier.id],
            );

            await sendTicketConfirmationEmail({
              order: { ...order, status: "PAID" },
              tickets: [
                {
                  id: ticketId,
                  orderId: order.id,
                  tierId: tier.id,
                  ticketCode,
                  qrHash,
                  attendeeName: order.customerName,
                  attendeeEmail: order.customerEmail,
                  status: "VALID",
                  tierName: tier.name,
                  paxPerUnit: tier.paxPerUnit,
                },
              ],
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe Webhook Handler Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

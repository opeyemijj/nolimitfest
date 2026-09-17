import { NextRequest, NextResponse } from "next/server";
import { getDb, dbQueryOne, dbExecute, dbQuery } from "@/lib/db";
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
      // Verify signature manually or via Stripe
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

      const order = dbQueryOne<any>(
        "SELECT * FROM orders WHERE stripeSessionId = ?",
        [sessionId],
      );
      if (order && order.status !== "PAID") {
        // Mark order as PAID
        dbExecute(
          `UPDATE orders SET status = 'PAID', stripePaymentIntent = ?, updatedAt = datetime('now') WHERE id = ?`,
          [session.payment_intent || "", order.id],
        );

        // Fetch order's event
        const festivalEvent = dbQueryOne<any>(
          "SELECT * FROM events WHERE id = ?",
          [order.eventId],
        );

        // Activate existing pending tickets or generate new if none
        const existingTickets = dbQuery<any>(
          "SELECT * FROM tickets WHERE orderId = ?",
          [order.id],
        );
        if (existingTickets.length > 0) {
          dbExecute(`UPDATE tickets SET status = 'VALID' WHERE orderId = ?`, [
            order.id,
          ]);
          for (const t of existingTickets) {
            dbExecute(
              `UPDATE ticket_tiers SET soldCount = soldCount + 1 WHERE id = ?`,
              [t.tierId],
            );
          }

          const activatedTickets = dbQuery<any>(
            `SELECT t.*, tt.name as tierName, tt.paxPerUnit 
             FROM tickets t 
             JOIN ticket_tiers tt ON t.tierId = tt.id 
             WHERE t.orderId = ?`,
            [order.id],
          );

          await sendTicketConfirmationEmail({
            order: { ...order, status: "PAID" },
            tickets: activatedTickets,
          });
        } else {
          // If no tickets were pre-created, generate a pass from the active tier
          const tier = dbQueryOne<any>(
            "SELECT * FROM ticket_tiers WHERE eventId = ? AND status = 'active' LIMIT 1",
            [order.eventId],
          );
          if (tier) {
            const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
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
                order.customerEmail,
              ],
            );

            // Increment sold count
            dbExecute(
              `UPDATE ticket_tiers SET soldCount = soldCount + 1 WHERE id = ?`,
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

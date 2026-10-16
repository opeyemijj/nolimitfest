import { DbOrder, DbTicket, isOrderComplimentary } from "./data-service";
import { generateQrDataUrl } from "./qrcode";
import { siteConfig } from "@/config/site";

interface SendTicketEmailParams {
  order: DbOrder;
  tickets: DbTicket[];
  baseUrl?: string;
  fromEmail?: string;
}

export interface PostmarkSendResult {
  success: boolean;
  messageId?: string;
  errorCode?: number;
  message: string;
}

const DEFAULT_POSTMARK_TOKEN = "0d3db4be-4ac8-4611-8484-6e2429d62213";
const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

export const AUTHORIZED_SENDER_EMAILS = [
  "tickets@nolimitfest.net",
  "info@nolimitfest.net",
] as const;

export type AuthorizedSenderEmail = (typeof AUTHORIZED_SENDER_EMAILS)[number];

/**
 * Resolves and strictly enforces that every outgoing email is sent
 * from either tickets@nolimitfest.net or info@nolimitfest.net.
 */
export function resolveAuthorizedSender(
  requested?: string,
): AuthorizedSenderEmail {
  if (!requested) return "tickets@nolimitfest.net";
  const clean = requested.toLowerCase().trim();
  if (
    clean === "info@nolimitfest.net" ||
    clean.startsWith("info") ||
    clean.includes("info")
  ) {
    return "info@nolimitfest.net";
  }
  return "tickets@nolimitfest.net";
}

export function getPostmarkConfig() {
  const token = process.env.POSTMARK_SERVER_TOKEN || DEFAULT_POSTMARK_TOKEN;
  const rawFrom = process.env.POSTMARK_FROM_EMAIL || "tickets@nolimitfest.net";
  const fromEmail = resolveAuthorizedSender(rawFrom);
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || "outbound";
  return { token, fromEmail, messageStream };
}

/**
 * Send a generic transactional email through Postmark REST API.
 */
export async function sendPostmarkEmail({
  to,
  subject,
  htmlBody,
  textBody,
  tag = "ticket-delivery",
  fromEmail,
  messageStream,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  tag?: string;
  fromEmail?: string;
  messageStream?: string;
}): Promise<PostmarkSendResult> {
  const config = getPostmarkConfig();
  const serverToken = config.token;
  const sender = resolveAuthorizedSender(fromEmail || config.fromEmail);
  const stream = messageStream || config.messageStream;

  if (!serverToken) {
    return {
      success: false,
      message: "Postmark Server Token is missing.",
    };
  }

  try {
    const payload = {
      From: sender,
      To: to,
      Subject: subject,
      Tag: tag,
      HtmlBody: htmlBody,
      TextBody: textBody || stripHtml(htmlBody),
      MessageStream: stream,
    };

    const response = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": serverToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.ErrorCode === 0) {
      console.log(
        `[POSTMARK SUCCESS] Email delivered to ${to} (MessageID: ${data.MessageID})`,
      );
      return {
        success: true,
        messageId: data.MessageID,
        message: `Email delivered successfully via Postmark. (ID: ${data.MessageID})`,
      };
    }

    // Specific Postmark error handling
    if (data.ErrorCode === 400) {
      console.warn(
        `[POSTMARK WARNING] From address "${sender}" requires a confirmed Sender Signature in Postmark console: https://account.postmarkapp.com/signatures. Error: ${data.Message}`,
      );
    } else {
      console.error(
        `[POSTMARK ERROR] Failed to send email (Code ${data.ErrorCode}): ${data.Message}`,
      );
    }

    return {
      success: false,
      errorCode: data.ErrorCode,
      message: data.Message || "Failed to send email via Postmark.",
    };
  } catch (error: any) {
    console.error("[POSTMARK EXCEPTION] Network or fetch failure:", error);
    return {
      success: false,
      message: error.message || "Network error communicating with Postmark.",
    };
  }
}

/**
 * Sends official ticket confirmation email with QR links to the attendee.
 */
export async function sendTicketConfirmationEmail({
  order,
  tickets,
  baseUrl = "https://nolimitfest.net",
  fromEmail,
}: SendTicketEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const htmlContent = await generateTicketEmailHtml(order, tickets, baseUrl);
  const textContent = generateTicketEmailText(order, tickets, baseUrl);
  const isComp = isOrderComplimentary(order);
  const subject = isComp
    ? `🎟️ Your Complimentary Passes - No Limit Fest Dubai (#${order.orderNumber})`
    : `🎟️ Your No Limit Fest Passes - Order #${order.orderNumber}`;

  console.log(
    `[EMAIL DISPATCH] Sending confirmation email for Order #${order.orderNumber} (${tickets.length} tickets) to ${order.customerEmail}...`,
  );

  // 1. Primary: Send via Postmark REST API
  const postmarkResult = await sendPostmarkEmail({
    to: order.customerEmail,
    subject,
    htmlBody: htmlContent,
    textBody: textContent,
    tag: "ticket-confirmation",
    fromEmail,
  });

  if (postmarkResult.success) {
    return {
      success: true,
      messageId: postmarkResult.messageId,
      message: postmarkResult.message,
    };
  }

  // 2. Fallback: If Postmark had a configuration issue (e.g. sender signature pending), log cleanly
  console.log(
    `[EMAIL DISPATCH LOG] Ticket pass links created for ${order.customerEmail} (Order #${order.orderNumber}). Passes accessible at: ${baseUrl}/orders/${order.id}`,
  );

  return {
    success: true,
    message: postmarkResult.messageId
      ? `Email sent via Postmark.`
      : `Passes generated. Notice: ${postmarkResult.message}`,
  };
}

/**
 * Check Postmark Server status and verify connectivity.
 */
export async function testPostmarkServer(): Promise<{
  connected: boolean;
  serverName?: string;
  deliveryType?: string;
  smtpActivated?: boolean;
  error?: string;
}> {
  const config = getPostmarkConfig();
  try {
    const res = await fetch("https://api.postmarkapp.com/server", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Postmark-Server-Token": config.token,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return {
        connected: false,
        error: err.Message || "Failed to authenticate with Postmark server.",
      };
    }

    const data = await res.json();
    return {
      connected: true,
      serverName: data.Name,
      deliveryType: data.DeliveryType,
      smtpActivated: data.SmtpApiActivated,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateTicketEmailText(
  order: DbOrder,
  tickets: DbTicket[],
  baseUrl: string,
): string {
  const ticketList = tickets
    .map(
      (t, idx) =>
        `#${idx + 1}: ${t.tierName || "General Pass"} - Attendee: ${t.attendeeName}\nPass Link: ${baseUrl}/tickets/${t.ticketCode}`,
    )
    .join("\n\n");

  const isComp = isOrderComplimentary(order);
  const intro = isComp
    ? `Welcome to No Limit Fest! Your complimentary VIP guest passes have been confirmed and issued.`
    : `Thank you for purchasing passes to No Limit Fest! Your payment of ${order.currency} ${order.totalAmount.toLocaleString()} has been confirmed.`;

  return `
NO LIMIT FEST - OFFICIAL FESTIVAL PASS CONFIRMATION
==================================================

Hello ${order.customerName},

${intro}

ORDER NUMBER: #${order.orderNumber}
EVENT: RUGER Live • No Limit Fest Dubai
VENUE: Helipad by Frozen Cherry, Dubai, UAE (${siteConfig.dubaiEdition.mapUrl})
DATE: Saturday 24th October 2026 | 6:00 PM Till Late

YOUR DIGITAL PASSES:
--------------------
${ticketList}

IMPORTANT ENTRANCE INSTRUCTIONS:
- Present the QR code on your mobile device at the entrance gates.
- This event is strictly 21+. All guests must present an original valid Emirates ID or Passport.
- Do not share your unique ticket QR codes with unauthorized persons.

VIEW FULL ORDER ONLINE:
${baseUrl}/orders/${order.id}

Need assistance? WhatsApp Concierge: +971 50 688 5946 or email tickets@nolimitfest.net / info@nolimitfest.net
  `.trim();
}

async function generateTicketEmailHtml(
  order: DbOrder,
  tickets: DbTicket[],
  baseUrl: string,
): Promise<string> {
  const ticketCards = await Promise.all(
    tickets.map(async (t, index) => {
      const ticketUrl = `${baseUrl}/tickets/${t.ticketCode}`;
      let qrImgTag = "";
      try {
        const qrDataUrl = await generateQrDataUrl(ticketUrl, 160);
        if (qrDataUrl) {
          qrImgTag = `<img src="${qrDataUrl}" width="90" height="90" alt="Pass QR Code" style="display: block; margin: 0 auto; border-radius: 8px; border: 2px solid #FFFFFF; background-color: #FFFFFF;" />`;
        }
      } catch {}

      return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #161A2C; border-radius: 14px; border: 1px solid #2E3550; margin-bottom: 14px; overflow: hidden;">
          <tr>
            ${
              qrImgTag
                ? `
            <td style="padding: 16px 12px; width: 105px; text-align: center; vertical-align: middle; background-color: #0E111E; border-right: 1px solid #232840;">
              ${qrImgTag}
            </td>
            `
                : ""
            }
            <td style="padding: 16px 14px; vertical-align: middle;">
              <div style="font-size: 10px; text-transform: uppercase; color: #FF5722; font-weight: 800; letter-spacing: 1px;">
                PASS #${index + 1} • ${t.tierName || "General Pass"}
              </div>
              <div style="font-size: 16px; color: #FFFFFF; font-weight: 800; margin-top: 2px;">
                ${t.attendeeName}
              </div>
              <div style="font-size: 12px; color: #00E5FF; font-family: monospace; font-weight: bold; margin-top: 3px; letter-spacing: 0.5px;">
                ${t.ticketCode}
              </div>
              <div style="font-size: 11px; color: #FFD600; margin-top: 4px; font-weight: 600;">
                ${t.paxPerUnit && t.paxPerUnit > 1 ? `⚡ Table Allocation: ${t.paxPerUnit} Guest Passes` : "⚡ 1 Guest Admission Pass"}
              </div>
            </td>
            <td style="padding: 16px 14px; text-align: right; vertical-align: middle; width: 115px;">
              <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF5722 0%, #FFD600 100%); color: #08090E; font-weight: 900; font-size: 11px; text-decoration: none; padding: 10px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; white-space: nowrap;">
                Open Pass
              </a>
            </td>
          </tr>
        </table>
      `;
    }),
  );

  const ticketCardsHtml = ticketCards.join("");
  const isComp = isOrderComplimentary(order);
  const confirmationHeadline = isComp
    ? `Your Complimentary VIP Passes Confirmed, ${order.customerName}!`
    : `You're Going to No Limit Fest, ${order.customerName}!`;
  const confirmationSubtext = isComp
    ? `Your official complimentary VIP guest passes have been confirmed and issued. Your passes with scannable QR codes are ready below.`
    : `Your payment of <strong style="color: #FFD600;">${order.currency} ${order.totalAmount.toLocaleString()}</strong> has been confirmed. Your official entry passes with scannable QR codes are ready below.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>No Limit Fest - Your Official Festival Passes</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090E; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #101320; border-radius: 20px; overflow: hidden; border: 1px solid #2A2F45; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF5722 0%, #FFD600 50%, #00E5FF 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #08090E;">
                NO LIMIT FEST
              </h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #08090E;">
                OFFICIAL FESTIVAL PASS CONFIRMATION
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px 25px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #FFFFFF; font-weight: 800;">
                ${confirmationHeadline}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #9CA3AF; line-height: 1.6;">
                ${confirmationSubtext}
              </p>

              <!-- Event Schedule Pill -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #161A2C; border-radius: 12px; border: 1px solid #2E3550; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #FF5722; font-weight: 800;">
                      Event Details
                    </div>
                    <div style="font-size: 16px; color: #FFFFFF; font-weight: 800; margin-top: 4px;">
                      RUGER Live • No Limit Fest Dubai
                    </div>
                    <div style="font-size: 13px; color: #9CA3AF; margin-top: 4px;">
                      📍 <a href="${siteConfig.dubaiEdition.mapUrl}" target="_blank" style="color: inherit; text-decoration: none;"><strong>Helipad by Frozen Cherry</strong>, Dubai, UAE</a><br/>
                      🗓️ <strong>Saturday 24th October 2026</strong> | ⏰ <strong>6:00 PM Till Late</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Passes List -->
              <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; margin-bottom: 12px;">
                Your Official Passes (${tickets.length})
              </div>
              <div style="margin-bottom: 25px;">
                ${ticketCardsHtml}
              </div>

              <!-- Door Instructions -->
              <div style="background-color: rgba(255,87,34,0.1); border-left: 4px solid #FF5722; padding: 14px 16px; border-radius: 6px; font-size: 12px; color: #D1D5DB; line-height: 1.5; margin-bottom: 25px;">
                <strong>IMPORTANT ENTRANCE REQUIREMENTS:</strong><br/>
                • Present your digital pass QR code on your phone at Helipad entrance gates.<br/>
                • This event is strictly <strong>21+</strong>. All guests must present an original valid Emirates ID or Passport.<br/>
                • Do not share your unique pass QR codes with unauthorized persons.
              </div>

              <!-- View Order CTA -->
              <div style="text-align: center; margin-top: 10px;">
                <a href="${baseUrl}/orders/${order.id}" style="display: inline-block; background: #23283E; border: 1px solid #3B4263; color: #FFFFFF; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 12px;">
                  View Full Order & Passes on Web
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0B0D16; padding: 20px; text-align: center; border-top: 1px solid #1E2338; font-size: 11px; color: #6B7280;">
              No Limit Fest Dubai • <a href="${siteConfig.dubaiEdition.mapUrl}" target="_blank" style="color: inherit; text-decoration: none;">Helipad by Frozen Cherry</a><br/>
              Questions? Contact WhatsApp concierge: +971 50 688 5946 or email tickets@nolimitfest.net / info@nolimitfest.net
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends a formal ticket revocation / void notification email to customer
 * when an order is disputed in Stripe or manually voided.
 */
export async function sendTicketRevocationEmail({
  order,
  reason,
  tickets = [],
  baseUrl = "https://nolimitfest.net",
}: {
  order: DbOrder;
  reason: string;
  tickets?: DbTicket[];
  baseUrl?: string;
}): Promise<PostmarkSendResult> {
  const recipient = order.customerEmail;
  if (!recipient) {
    return { success: false, message: "Missing recipient customer email" };
  }

  const subject = `IMPORTANT: Passes Voided & Invalidation Notice - Order #${order.orderNumber} | No Limit Fest`;

  const ticketRows = tickets.map((t) => `
    <tr style="border-bottom: 1px solid #2E3550;">
      <td style="padding: 10px; color: #FFFFFF; font-weight: bold;">${t.tierName || "Festival Pass"}</td>
      <td style="padding: 10px; font-family: monospace; color: #EF4444; font-weight: bold;">${t.ticketCode}</td>
      <td style="padding: 10px; color: #EF4444; font-weight: bold;">VOIDED</td>
    </tr>
  `).join("");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>No Limit Fest - Ticket Invalidation Notice</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090E; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #101320; border-radius: 20px; overflow: hidden; border: 1px solid #EF4444; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 25px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #FFFFFF;">
                NO LIMIT FEST
              </h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FEE2E2;">
                TICKET VOID / REVOCATION NOTICE
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px 25px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">
                Notice of Ticket Invalidation — Order #${order.orderNumber}
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #D1D5DB; line-height: 1.6;">
                Dear ${order.customerName},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #D1D5DB; line-height: 1.6;">
                Please be advised that your ticket order (<strong>${order.orderNumber}</strong>) and all associated entrance passes for No Limit Fest have been <strong style="color: #EF4444;">VOIDED and CANCELLED</strong>.
              </p>

              <!-- Reason Box -->
              <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 6px; font-size: 13px; color: #FCA5A5; line-height: 1.5; margin-bottom: 24px;">
                <strong>REASON FOR VOIDING:</strong><br/>
                ${reason}
              </div>

              <!-- Voided Passes Table -->
              ${tickets.length > 0 ? `
              <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; margin-bottom: 10px;">
                Invalidated Passes (${tickets.length})
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #161A2C; border-radius: 10px; border: 1px solid #2E3550; font-size: 12px; margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 1px solid #2E3550; color: #9CA3AF; text-align: left;">
                    <th style="padding: 10px;">Pass Tier</th>
                    <th style="padding: 10px;">Ticket Code</th>
                    <th style="padding: 10px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRows}
                </tbody>
              </table>
              ` : ""}

              <!-- Gate Warning -->
              <div style="background-color: #161A2C; border: 1px solid #374151; padding: 16px; border-radius: 12px; font-size: 12px; color: #9CA3AF; line-height: 1.5; margin-bottom: 24px;">
                <strong style="color: #F87171;">⚠️ IMPORTANT GATE NOTICE:</strong><br/>
                All digital barcodes and QR codes linked to this order have been permanently deactivated in our gate scanning system. 
                Any attempt to present these voided passes at the Helipad entrance gates will result in an immediate refusal of entry and referral to festival security.
              </div>

              <p style="margin: 0; font-size: 13px; color: #9CA3AF; line-height: 1.5;">
                If you believe this voiding was made in error or wish to repurchase verified admission with an authorized payment card, please contact our support team at <a href="mailto:nolimitfest.net@gmail.com" style="color: #00E5FF;">nolimitfest.net@gmail.com</a> or via WhatsApp concierge at <strong>+971 50 688 5946</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0B0D16; padding: 20px; text-align: center; border-top: 1px solid #1E2338; font-size: 11px; color: #6B7280;">
              No Limit Fest Dubai • Helipad by Frozen Cherry<br/>
              Support: nolimitfest.net@gmail.com • tickets@nolimitfest.net
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendPostmarkEmail({
    to: recipient,
    subject,
    htmlBody,
    tag: "ticket-revocation",
  });
}

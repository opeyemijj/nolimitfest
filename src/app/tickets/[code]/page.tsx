import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTicketByCode } from "@/lib/data-service";
import { getAuthUser } from "@/lib/auth";
import { generateQrSvg } from "@/lib/qrcode";
import TicketPassView from "@/components/tickets/TicketPassView";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await props.params;
  const ticket = await getTicketByCode(code);
  if (!ticket) return { title: "Ticket Not Found - No Limit Fest" };
  return {
    title: `Pass #${ticket.ticketCode} - ${ticket.attendeeName} | No Limit Fest Dubai`,
    description: `Official digital pass for ${ticket.eventName || "No Limit Fest"} at ${ticket.eventVenue || "Helipad by Frozen Cherry"}.`,
  };
}

export default async function TicketPage(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  const ticket = await getTicketByCode(code);

  if (!ticket) {
    notFound();
  }

  // Derive direct absolute URL for camera scanners and sharing
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
  const ticketUrl = `${origin}/tickets/${ticket.ticketCode}`;

  // Generate genuine camera-scannable ISO standard QR code encoding the absolute URL
  const qrSvg = await generateQrSvg(ticketUrl, 260);

  const authUser = await getAuthUser();
  const plainTicket = JSON.parse(JSON.stringify(ticket));
  const plainAuthUser = authUser ? JSON.parse(JSON.stringify(authUser)) : null;

  return (
    <TicketPassView
      ticket={plainTicket}
      qrSvg={qrSvg}
      authUser={plainAuthUser}
      ticketUrl={ticketUrl}
    />
  );
}

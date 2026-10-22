import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import {
  Receipt,
  QrCode,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  Ticket,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { dbQueryOne, dbQuery } from "@/lib/db";
import { generateQrSvg } from "@/lib/qrcode";

export const dynamic = "force-dynamic";

export default async function WalkInInvoicePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // 1. Fetch Order
  const order = await dbQueryOne<any>(
    `SELECT
       o.id,
       o.order_number AS "orderNumber",
       o.event_id AS "eventId",
       o.customer_name AS "customerName",
       o.customer_email AS "customerEmail",
       o.customer_phone AS "customerPhone",
       o.total_amount AS "totalAmount",
       o.currency,
       o.status,
       o.notes,
       o.created_at AS "createdAt",
       e.name AS "eventName",
       e.venue AS "eventVenue"
     FROM orders o
     LEFT JOIN events e ON o.event_id = e.id
     WHERE o.id = $1 OR o.order_number = $1`,
    [id],
  );

  if (!order) {
    notFound();
  }

  // 2. Fetch Tickets for this order
  const tickets = await dbQuery<any>(
    `SELECT
       t.id,
       t.ticket_code AS "ticketCode",
       t.attendee_name AS "attendeeName",
       t.status,
       COALESCE(tt.name, 'Festival Pass') AS "tierName",
       COALESCE(tt.price, 0) AS "tierPrice",
       COALESCE(tt.category, 'phase') AS category,
       COALESCE(tt.wristband_color, 'NEON GREEN') AS "wristbandColor"
     FROM tickets t
     LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
     WHERE t.order_id = $1`,
    [order.id],
  );

  // 3. Resolve Origin for Admin QR Code Link
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  // This QR code is scanned by cashier admin staff at the entrance counter.
  // It directly opens the Admin payment & order resolution screen!
  const adminCollectUrl = `${origin}/admin/walk-ins/${order.id}`;
  const qrSvg = await generateQrSvg(adminCollectUrl, 320);

  const isPaid = order.status === "PAID";
  const isCancelled = order.status === "CANCELLED";
  const isPending = !isPaid && !isCancelled;

  // Breakdown calculation
  const totalAmount = Number(order.totalAmount || 0);
  const baseTotal = Math.round((totalAmount / 1.05) * 100) / 100;
  const serviceCharge = Math.round((totalAmount - baseTotal) * 100) / 100;
  const currency = order.currency || "AED";

  return (
    <div className="min-h-screen bg-[#08090E] text-white pt-20 pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#FF5722]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        {/* Header Badge */}
        <div className="text-center space-y-2">
          {isPaid ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Payment Verified • Passes Active</span>
            </div>
          ) : isCancelled ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500 text-red-300 text-xs font-black uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Invoice Cancelled</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Pending Payment at Counter</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-mono">
            Walk-in Festival Invoice
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
            Invoice #{order.orderNumber}
          </p>
        </div>

        {/* Big QR Code Card (Presented to Payment Counter Staff) */}
        <div className="p-6 rounded-3xl bg-[#121420] border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 block font-mono">
              Cashier Scan Code
            </span>
            <p className="text-xs text-gray-300">
              Present this QR code to staff at the Payment Desk to pay and collect your wristband.
            </p>
          </div>

          {/* High-Resolution QR Code */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">
              Invoice Reference Code
            </span>
            <p className="text-lg font-mono font-black text-amber-300 tracking-wider">
              {order.orderNumber}
            </p>
          </div>

          {/* If Paid: Quick Button to view passes */}
          {isPaid && tickets.length > 0 && (
            <div className="pt-2">
              <Link
                href={`/tickets/${tickets[0].ticketCode}`}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Ticket className="w-4 h-4" />
                <span>View Official Digital Entry Pass</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Invoice Summary Card */}
        <div className="p-6 rounded-3xl bg-[#121420]/90 backdrop-blur-xl border border-white/10 shadow-xl space-y-5">
          {/* Customer Details */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              Guest Contact Details
            </span>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-white">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Name</span>
                </span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </span>
                <span className="font-bold">{order.customerPhone}</span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Email</span>
                </span>
                <span className="font-bold">{order.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Ticket Items */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              Pass Itemization ({tickets.length})
            </span>
            <div className="space-y-2">
              {tickets.map((t: any, i: number) => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">
                      Pass #{i + 1}: {t.tierName}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Guest: {t.attendeeName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {currency} {Number(t.tierPrice).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown with 5% Charges */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-gray-300">
              <span>Passes Subtotal</span>
              <span className="font-mono">{currency} {baseTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>5% Service &amp; Entrance Charges</span>
              <span className="font-mono text-amber-300">+{currency} {serviceCharge.toLocaleString()}</span>
            </div>
            <div className="pt-2.5 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="text-sm font-black uppercase text-white block">
                  Total Due at Counter
                </span>
                <span className="text-[10px] text-gray-400">Cash or Card accepted</span>
              </div>
              <span className="text-2xl font-black font-mono text-[#00E5FF]">
                {currency} {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cashier Instructions */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-bold">
              Step forward to the Cashier Desk and present the QR code on this screen. Staff will collect payment and issue your festival wristband.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-2">
          <Link href="/walk-in" className="hover:text-white transition-colors">
            ← New Walk-in Registration
          </Link>
          <a
            href="https://wa.me/971506885946"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need Help?</span>
          </a>
        </div>
      </div>
    </div>
  );
}

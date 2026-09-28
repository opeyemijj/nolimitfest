import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  getOrderById,
  getActiveEvent,
  fulfillOrderFromStripeSession,
  isOrderConfirmed,
  isOrderComplimentary,
  isTicketConfirmedAndValid,
} from "@/lib/data-service";
import {
  CheckCircle2,
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const order = await getOrderById(id);
  if (!order) return { title: "Order Not Found - No Limit Fest" };
  const confirmed = isOrderConfirmed(order);
  const isComp = isOrderComplimentary(order);
  return {
    title: confirmed
      ? isComp
        ? `Complimentary Pass #${order.orderNumber} Confirmed | No Limit Fest`
        : `Order #${order.orderNumber} Confirmed | No Limit Fest`
      : `Order #${order.orderNumber} Pending Payment | No Limit Fest`,
  };
}

export default async function OrderConfirmationPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const { id } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const sessionId = searchParams?.session_id;

  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  if (sessionId) {
    await fulfillOrderFromStripeSession(sessionId, origin);
  }

  let order = await getOrderById(id);
  if (order && order.status === "PENDING" && order.stripeSessionId) {
    const updated = await fulfillOrderFromStripeSession(
      order.stripeSessionId,
      origin,
    );
    if (updated) order = updated;
  }

  if (!order) {
    notFound();
  }

  const currentEvent = await getActiveEvent();
  const isConfirmed = isOrderConfirmed(order);
  const isComp = isOrderComplimentary(order);
  const isPaid = isConfirmed && !isComp;
  const validTickets =
    order.tickets?.filter((t) => isTicketConfirmedAndValid(t)) || [];

  return (
    <div className="min-h-screen bg-[#08090E] text-white pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FF5722]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Header - Only confirmed (Paid or Complimentary) orders show passes */}
        {isConfirmed ? (
          isComp ? (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 text-[#00E5FF] flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25 animate-bounce">
                <Sparkles className="w-8 h-8 text-[#00E5FF]" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Complimentary Pass Confirmed!
              </h1>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Welcome,{" "}
                <strong className="text-white">{order.customerName}</strong>!
                Your official complimentary festival pass has been confirmed and
                issued.
              </p>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300">
                <span>Pass #{order.orderNumber}</span>
                <span className="text-gray-500">•</span>
                <span className="text-[#00E5FF] font-bold">
                  COMPLIMENTARY GUEST
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Order Confirmed!
              </h1>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Thank you,{" "}
                <strong className="text-white">{order.customerName}</strong>!
                Your payment of{" "}
                <strong className="text-[#FFD600]">
                  {order.currency} {order.totalAmount.toLocaleString()}
                </strong>{" "}
                has been processed.
              </p>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00E5FF]">
                <span>Order #{order.orderNumber}</span>
                <span className="text-gray-500">•</span>
                <span className="text-emerald-400 font-bold">PAID</span>
              </div>
            </div>
          )
        ) : (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Payment Incomplete / Pending
            </h1>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              We have not received payment confirmation for Order #
              <span className="font-mono text-white">{order.orderNumber}</span>.
              Digital passes are strictly issued only once payment is verified
              or complimentary status is confirmed.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
              <span>Status: PAYMENT PENDING</span>
            </div>
          </div>
        )}

        {/* Digital Passes Grid - Only shown when order is confirmed (PAID or COMPLIMENTARY) */}
        {isConfirmed ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-[#FF5722]" />
                <span>
                  Your Official Festival Passes ({validTickets.length})
                </span>
              </h2>
              <span className="text-xs text-gray-400 hidden sm:inline">
                Tap any pass to view full QR ticket
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {validTickets.map((ticket, index) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.ticketCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 rounded-2xl bg-[#131626] hover:bg-[#181C30] border border-white/10 hover:border-[#FF5722]/50 transition-all flex items-center justify-between shadow-xl"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase">
                        Pass #{index + 1}
                      </span>
                      <span className="text-xs text-[#FFD600] font-bold">
                        {ticket.tierName || "Festival Pass"}
                      </span>
                    </div>

                    <p className="text-base font-black text-white group-hover:text-[#00E5FF] transition-colors">
                      {ticket.attendeeName}
                    </p>

                    <p className="text-xs font-mono text-gray-400">
                      Ref: {ticket.ticketCode} • {ticket.paxPerUnit || 1} guest(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-black text-xs uppercase tracking-wider group-hover:scale-105 transition-transform flex items-center gap-1.5 shadow-md shadow-orange-500/20">
                      <span>View QR Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-[#121422] border border-amber-500/30 text-center space-y-4 shadow-xl">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                No Passes Issued For Unconfirmed Order
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Only paid and complementary tickets receive active digital
                passes and admission at the gates. If you were redirected before
                completing your Stripe payment, your card was not charged.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#tickets"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                Complete Booking in Festival Store
              </Link>
              <a
                href="https://wa.me/971506885946"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider hover:bg-emerald-600/40 transition-all inline-flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Contact WhatsApp Support</span>
              </a>
            </div>
          </div>
        )}

        {/* Event Logistics Card */}
        <div className="p-6 rounded-3xl bg-[#10121D] border border-white/10 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-300">
            Event Logistics &amp; Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Calendar className="w-4 h-4 text-[#FF5722] mb-1" />
              <p className="text-gray-400 text-[10px]">Date</p>
              <p className="font-bold text-white">{currentEvent.dates}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-[#FFD600] mb-1" />
              <p className="text-gray-400 text-[10px]">Doors Open</p>
              <p className="font-bold text-white">{currentEvent.time}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <MapPin className="w-4 h-4 text-[#00E5FF] mb-1" />
              <p className="text-gray-400 text-[10px]">Venue</p>
              <p className="font-bold text-white truncate">
                {currentEvent.venue}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Please present your digital passes with QR codes at the Helipad
            entrance gates. Original Emirates ID or Passport required (Strictly
            21+).
          </p>
        </div>

        {/* Back to Festival */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <span>Return to Festival Guide</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

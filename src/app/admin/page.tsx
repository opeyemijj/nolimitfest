import { getAuthUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";
import { dbQuery, dbQueryOne } from "@/lib/db";
import Link from "next/link";
import {
  TrendingUp,
  Ticket,
  Users,
  DollarSign,
  QrCode,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Staff without dashboard permission (e.g. Gate Staff) are automatically routed to their console
  if (!hasPermission(user, "dashboard")) {
    redirect("/admin/scan");
  }

  // Metrics calculation
  const revenueStats = (await dbQueryOne<{
    totalRevenue: number;
    paidOrdersCount: number;
  }>(
    `SELECT COALESCE(SUM(total_amount), 0) AS "totalRevenue", COUNT(id) AS "paidOrdersCount"
     FROM orders WHERE status = 'PAID'`,
  )) || { totalRevenue: 0, paidOrdersCount: 0 };

  const ticketStats = (await dbQueryOne<{
    totalSold: number;
    totalCapacity: number;
    totalCheckedIn: number;
  }>(
    `SELECT
      COALESCE(SUM(sold_count), 0) AS "totalSold",
      COALESCE(SUM(capacity), 0) AS "totalCapacity",
      (SELECT COUNT(*) FROM tickets WHERE status = 'CHECKED_IN') AS "totalCheckedIn"
     FROM ticket_tiers`,
  )) || { totalSold: 0, totalCapacity: 0, totalCheckedIn: 0 };

  const checkInRate =
    ticketStats.totalSold > 0
      ? Math.round((ticketStats.totalCheckedIn / ticketStats.totalSold) * 100)
      : 0;

  const recentOrders = await dbQuery<any>(
    `SELECT o.id, o.order_number AS "orderNumber", o.customer_name AS "customerName",
            o.total_amount AS "totalAmount", o.currency, o.status,
            o.created_at AS "createdAt",
            e.city, COUNT(t.id) AS "ticketsCount"
     FROM orders o
     LEFT JOIN events e ON o.event_id = e.id
     LEFT JOIN tickets t ON o.id = t.order_id
     GROUP BY o.id, e.city
     ORDER BY o.created_at DESC LIMIT 8`,
  );

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
            Festival Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Executive Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Welcome back, <strong className="text-white">{user?.name}</strong>.
            Real-time overview of festival operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/scan"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Total Gross Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              AED {revenueStats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{revenueStats.paidOrdersCount} Paid Orders</span>
            </p>
          </div>
        </div>

        {/* Tickets Sold */}
        <div className="p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Tickets &amp; Passes Sold
            </span>
            <div className="p-2 rounded-xl bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {ticketStats.totalSold.toLocaleString()}{" "}
              <span className="text-xs text-gray-400 font-normal">
                / {ticketStats.totalCapacity.toLocaleString()}
              </span>
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF5722] to-[#FFD600] h-1.5 rounded-full transition-all"
                style={{
                  width: `${ticketStats.totalCapacity > 0 ? (ticketStats.totalSold / ticketStats.totalCapacity) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Gate Check-in Rate */}
        <div className="p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Gate Check-In Rate
            </span>
            <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {checkInRate}%
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              <strong className="text-white">
                {ticketStats.totalCheckedIn}
              </strong>{" "}
              attendees checked in
            </p>
          </div>
        </div>

        {/* Active Edition */}
        <div className="p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Active Edition
            </span>
            <div className="p-2 rounded-xl bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-white truncate">
              Dubai 2026 (Flagship)
            </p>
            <p className="text-[11px] text-gray-400 mt-1 truncate">
              Helipad by Frozen Cherry • Oct 24
            </p>
          </div>
        </div>
      </div>

      {/* QUICK SHORTCUT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/tickets"
          className="p-5 rounded-2xl bg-gradient-to-br from-[#141828] to-[#101322] border border-white/10 hover:border-[#FF5722]/50 transition-all flex items-center justify-between group shadow-xl"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider block">
              Inventory
            </span>
            <h4 className="text-base font-black text-white group-hover:text-[#FFD600] transition-colors">
              Configure Ticket Tiers &amp; Pricing
            </h4>
            <p className="text-xs text-gray-400">
              Edit Early Bird, phases, squad passes, and VIP tables
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/events"
          className="p-5 rounded-2xl bg-gradient-to-br from-[#141828] to-[#101322] border border-white/10 hover:border-[#00E5FF]/50 transition-all flex items-center justify-between group shadow-xl"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider block">
              Tour Logistics
            </span>
            <h4 className="text-base font-black text-white group-hover:text-[#00E5FF] transition-colors">
              Manage Events &amp; Tour Cities
            </h4>
            <p className="text-xs text-gray-400">
              Edit venues, dates, capacities, and festival status
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/scan"
          className="p-5 rounded-2xl bg-gradient-to-br from-[#141828] to-[#101322] border border-white/10 hover:border-emerald-500/50 transition-all flex items-center justify-between group shadow-xl"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Gate Operations
            </span>
            <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
              High-Speed Gate QR Scanner
            </h4>
            <p className="text-xs text-gray-400">
              Scan tickets with camera and check in attendees
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-gray-400">
              Latest ticket purchases and comp pass allocations
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#00E5FF] hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            No orders recorded yet. As attendees purchase tickets, they will
            appear here in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-2">Order Ref</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Tickets</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((ord: any) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-2 font-mono font-bold text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-white">
                        {ord.customerName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {ord.customerEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-medium text-gray-300">
                      {ord.ticketsCount || 1} pass(es)
                    </td>
                    <td className="py-3.5 px-2 font-mono font-bold text-[#FFD600]">
                      {ord.currency} {ord.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ord.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-gray-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <Link
                        href={`/orders/${ord.id}`}
                        target="_blank"
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-gray-300 hover:text-white"
                      >
                        Passes ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

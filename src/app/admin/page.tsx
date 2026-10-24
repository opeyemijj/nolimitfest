import VenueLink from "@/components/layout/VenueLink";
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
  Crown,
  User,
  Sparkles,
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

  // 1. Revenue Metrics
  const revenueStats = (await dbQueryOne<{
    totalRevenue: number;
    paidOrdersCount: number;
  }>(
    `SELECT COALESCE(SUM(total_amount), 0) AS "totalRevenue", COUNT(id) AS "paidOrdersCount"
     FROM orders WHERE status = 'PAID'`,
  )) || { totalRevenue: 0, paidOrdersCount: 0 };

  // 2. Expected Guests & Paid Tickets Calculation (Calculates squads of 4 as 4 guests, tables of 6 as 6 guests, etc.)
  const paidGuestStats = (await dbQueryOne<{
    totalExpectedGuests: number;
    totalPaidPasses: number;
    totalCheckedInGuests: number;
    totalCheckedInPasses: number;
    gaGuests: number;
    gaPasses: number;
    groupSquadGuests: number;
    groupSquadPasses: number;
    vipTableGuests: number;
    vipTablePasses: number;
  }>(
    `SELECT
      COALESCE(SUM(COALESCE(tt.pax_per_unit, 1)), 0) AS "totalExpectedGuests",
      COUNT(t.id) AS "totalPaidPasses",
      COALESCE(SUM(CASE WHEN t.status = 'CHECKED_IN' THEN COALESCE(tt.pax_per_unit, 1) ELSE 0 END), 0) AS "totalCheckedInGuests",
      COALESCE(SUM(CASE WHEN t.status = 'CHECKED_IN' THEN 1 ELSE 0 END), 0) AS "totalCheckedInPasses",
      COALESCE(SUM(CASE WHEN COALESCE(tt.category, 'phase') = 'phase' THEN COALESCE(tt.pax_per_unit, 1) ELSE 0 END), 0) AS "gaGuests",
      COALESCE(SUM(CASE WHEN COALESCE(tt.category, 'phase') = 'phase' THEN 1 ELSE 0 END), 0) AS "gaPasses",
      COALESCE(SUM(CASE WHEN tt.category = 'group' THEN COALESCE(tt.pax_per_unit, 1) ELSE 0 END), 0) AS "groupSquadGuests",
      COALESCE(SUM(CASE WHEN tt.category = 'group' THEN 1 ELSE 0 END), 0) AS "groupSquadPasses",
      COALESCE(SUM(CASE WHEN tt.category IN ('table', 'vvip') THEN COALESCE(tt.pax_per_unit, 1) ELSE 0 END), 0) AS "vipTableGuests",
      COALESCE(SUM(CASE WHEN tt.category IN ('table', 'vvip') THEN 1 ELSE 0 END), 0) AS "vipTablePasses"
    FROM tickets t
    JOIN orders o ON t.order_id = o.id
    LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
    WHERE o.status = 'PAID'
      AND t.status != 'VOIDED'
      AND t.status != 'CANCELLED'`,
  )) || {
    totalExpectedGuests: 0,
    totalPaidPasses: 0,
    totalCheckedInGuests: 0,
    totalCheckedInPasses: 0,
    gaGuests: 0,
    gaPasses: 0,
    groupSquadGuests: 0,
    groupSquadPasses: 0,
    vipTableGuests: 0,
    vipTablePasses: 0,
  };

  // 3. Capacities across all configured tiers
  const capacityStats = (await dbQueryOne<{
    totalPassCapacity: number;
    totalGuestCapacity: number;
  }>(
    `SELECT
      COALESCE(SUM(capacity), 0) AS "totalPassCapacity",
      COALESCE(SUM(capacity * COALESCE(pax_per_unit, 1)), 0) AS "totalGuestCapacity"
     FROM ticket_tiers`,
  )) || { totalPassCapacity: 0, totalGuestCapacity: 0 };

  const guestCheckInRate =
    paidGuestStats.totalExpectedGuests > 0
      ? Math.round(
          (paidGuestStats.totalCheckedInGuests / paidGuestStats.totalExpectedGuests) * 100,
        )
      : 0;

  // 4. Live Tier Breakdown with Expected Guests Calculation
  const tierBreakdown = await dbQuery<{
    id: string;
    name: string;
    category: string;
    paxPerUnit: number;
    color: string;
    wristbandColor: string;
    capacity: number;
    passCount: number;
    expectedGuests: number;
    checkedInGuests: number;
  }>(
    `SELECT
      tt.id,
      tt.name,
      tt.category,
      COALESCE(tt.pax_per_unit, 1) AS "paxPerUnit",
      COALESCE(tt.color, '#00E676') AS "color",
      COALESCE(tt.wristband_color, 'NEON GREEN') AS "wristbandColor",
      tt.capacity,
      COUNT(t.id) AS "passCount",
      SUM(COALESCE(tt.pax_per_unit, 1)) AS "expectedGuests",
      SUM(CASE WHEN t.status = 'CHECKED_IN' THEN COALESCE(tt.pax_per_unit, 1) ELSE 0 END) AS "checkedInGuests"
    FROM tickets t
    JOIN orders o ON t.order_id = o.id
    LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
    WHERE o.status = 'PAID'
      AND t.status != 'VOIDED'
      AND t.status != 'CANCELLED'
    GROUP BY tt.id, tt.name, tt.category, tt.pax_per_unit, tt.color, tt.wristband_color, tt.capacity, tt.sort_order
    ORDER BY "expectedGuests" DESC, tt.sort_order ASC`,
  );

  // 5. Recent Orders with Expected Guests Calculation
  const recentOrders = await dbQuery<any>(
    `SELECT o.id, o.order_number AS "orderNumber", o.customer_name AS "customerName",
            o.customer_email AS "customerEmail",
            o.total_amount AS "totalAmount", o.currency, o.status,
            o.created_at AS "createdAt",
            e.city,
            COUNT(t.id) AS "ticketsCount",
            COALESCE(SUM(COALESCE(tt.pax_per_unit, 1)), 0) AS "expectedGuests",
            STRING_AGG(DISTINCT tt.name, ', ') AS "tierNames"
     FROM orders o
     LEFT JOIN events e ON o.event_id = e.id
     LEFT JOIN tickets t ON o.id = t.order_id
     LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
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
            Real-time overview of festival operations and audience numbers.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

        {/* PROMINENT SPOTLIGHT: TOTAL EXPECTED GUESTS (PAID) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#00E5FF]/10 via-[#121524] to-[#121524] border border-[#00E5FF]/40 space-y-3 shadow-lg shadow-cyan-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
              Total Expected Guests
            </span>
            <div className="p-2 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
              <span>{paidGuestStats.totalExpectedGuests.toLocaleString()}</span>
              <span className="text-xs text-gray-400 font-normal">
                / {capacityStats.totalGuestCapacity.toLocaleString()} max
              </span>
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00E5FF] to-emerald-400 h-1.5 rounded-full transition-all"
                style={{
                  width: `${capacityStats.totalGuestCapacity > 0 ? Math.min(100, (paidGuestStats.totalExpectedGuests / capacityStats.totalGuestCapacity) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-cyan-300 font-bold mt-1.5 flex items-center justify-between">
              <span>Groups &amp; Tables: {paidGuestStats.groupSquadGuests + paidGuestStats.vipTableGuests}</span>
              <span className="text-gray-400">GA: {paidGuestStats.gaGuests}</span>
            </p>
          </div>
        </div>

        {/* Tickets & Passes Sold */}
        <div className="p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Passes &amp; Units Sold
            </span>
            <div className="p-2 rounded-xl bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {paidGuestStats.totalPaidPasses.toLocaleString()}{" "}
              <span className="text-xs text-gray-400 font-normal">
                / {capacityStats.totalPassCapacity.toLocaleString()}
              </span>
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF5722] to-[#FFD600] h-1.5 rounded-full transition-all"
                style={{
                  width: `${capacityStats.totalPassCapacity > 0 ? (paidGuestStats.totalPaidPasses / capacityStats.totalPassCapacity) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <strong className="text-white">
                {(capacityStats.totalPassCapacity - paidGuestStats.totalPaidPasses).toLocaleString()}
              </strong>{" "}
              passes remaining
            </p>
          </div>
        </div>

        {/* Gate Check-in Rate */}
        <div className="p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Gate Check-In Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {guestCheckInRate}%
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              <strong className="text-white">
                {paidGuestStats.totalCheckedInGuests}
              </strong>{" "}
              of {paidGuestStats.totalExpectedGuests} guests checked in
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
              <VenueLink>Helipad by Frozen Cherry</VenueLink> • Oct 24
            </p>
          </div>
        </div>
      </div>

      {/* EXPECTED GUESTS & CAPACITY ALLOCATION BREAKDOWN MODULE */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight">
                Expected Guests by Tier &amp; Pax Allocation
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Precise guest count calculation based on party size: single passes (1 guest), squad packs (4–6 guests), and VIP tables (4–10 guests).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>{paidGuestStats.totalExpectedGuests} Total Expected Attendees</span>
            </span>
          </div>
        </div>

        {/* 3 Quick Category Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              General Admission (1 Pax)
            </span>
            <p className="text-xl font-black text-white font-mono">
              {paidGuestStats.gaGuests}{" "}
              <span className="text-xs text-gray-400 font-normal">
                Guests ({paidGuestStats.gaPasses} passes)
              </span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF]">
              Squad &amp; Crew Packs (4–6 Pax)
            </span>
            <p className="text-xl font-black text-[#00E5FF] font-mono">
              {paidGuestStats.groupSquadGuests}{" "}
              <span className="text-xs text-gray-400 font-normal">
                Guests ({paidGuestStats.groupSquadPasses} packs)
              </span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-[#FFD600]/20 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD600]">
              VIP Hospitality Tables (4–10 Pax)
            </span>
            <p className="text-xl font-black text-[#FFD600] font-mono">
              {paidGuestStats.vipTableGuests}{" "}
              <span className="text-xs text-gray-400 font-normal">
                Guests ({paidGuestStats.vipTablePasses} tables)
              </span>
            </p>
          </div>
        </div>

        {/* Live Tier Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Ticket Tier</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Party Size (Pax)</th>
                <th className="py-3 px-3">Paid Passes Sold</th>
                <th className="py-3 px-3">Total Expected Guests</th>
                <th className="py-3 px-3">Admitted at Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tierBreakdown.map((tb) => {
                const isGroupOrTable = tb.paxPerUnit > 1;
                return (
                  <tr key={tb.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tb.color || "#00E676" }}
                        />
                        <span className="font-bold text-white">{tb.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold uppercase text-gray-300">
                        {tb.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isGroupOrTable
                            ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30"
                            : "bg-white/5 text-gray-300"
                        }`}
                      >
                        {tb.paxPerUnit} {tb.paxPerUnit === 1 ? "Guest" : "Guests / Unit"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-gray-300">
                      {tb.passCount} {tb.passCount === 1 ? "unit" : "units"}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-[#00E5FF]">
                          {tb.expectedGuests} Guests
                        </span>
                        {isGroupOrTable && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            ({tb.passCount} × {tb.paxPerUnit} pax)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-gray-300 font-mono">
                        <strong className="text-emerald-400">{tb.checkedInGuests || 0}</strong> / {tb.expectedGuests}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              Latest ticket purchases and expected guest counts
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
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Tickets &amp; Expected Guests</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((ord: any) => {
                  const guests = Number(ord.expectedGuests) || Number(ord.ticketsCount) || 1;
                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-white">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">
                          {ord.customerName}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {ord.customerEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span>
                            {guests} Expected Guest{guests === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {ord.ticketsCount || 1} pass(es) {ord.tierNames ? `• ${ord.tierNames}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#FFD600]">
                        {ord.currency} {ord.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3">
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
                      <td className="py-3.5 px-3 text-gray-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/orders/${ord.id}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-gray-300 hover:text-white"
                        >
                          Passes ↗
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

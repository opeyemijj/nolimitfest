"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Search,
  Download,
  Filter,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  MessageCircle,
  Crown,
  Tag,
  Calendar,
  X,
  RefreshCw,
  Sparkles,
  DollarSign,
  UserCheck,
  Building,
  Mail,
  Phone,
} from "lucide-react";

interface BuyerRecord {
  ticketId: string;
  ticketCode: string;
  attendeeName: string;
  attendeeEmail: string | null;
  ticketStatus: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
  ticketCreatedAt: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string | null;
  orderNotes: string | null;
  orderTotalAmount: number;
  orderCurrency: string;
  orderStatus: string;
  isDeposit?: boolean;
  depositAmount?: number;
  remainingBalance?: number;
  orderCreatedAt: string;
  tierId: string;
  tierName: string;
  tierCategory: string;
  tierPrice: number;
  tierCurrency: string;
  paxPerUnit: number;
  tierColor?: string;
  wristbandColor?: string;
  eventId: string;
  eventSlug: string;
  eventName: string;
  eventCity: string;
  eventCountry: string;
}

interface EventOption {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  status: string;
}

interface TierOption {
  id: string;
  eventId: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  paxPerUnit: number;
}

function BuyersTableContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [records, setRecords] = useState<BuyerRecord[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [summary, setSummary] = useState({
    totalPasses: 0,
    totalBuyers: 0,
    totalRevenue: 0,
    checkedInCount: 0,
    checkedInRate: 0,
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(
    searchParams.get("eventId") || "ALL",
  );
  const [selectedTierId, setSelectedTierId] = useState<string>(
    searchParams.get("tierId") || "ALL",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get("status") || "ALL",
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Synchronize state when URL changes
  useEffect(() => {
    const urlEvent = searchParams.get("eventId");
    const urlTier = searchParams.get("tierId");
    if (urlEvent && urlEvent !== selectedEventId) setSelectedEventId(urlEvent);
    if (urlTier && urlTier !== selectedTierId) setSelectedTierId(urlTier);
  }, [searchParams]);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEventId && selectedEventId !== "ALL") {
        params.append("eventId", selectedEventId);
      }
      if (selectedTierId && selectedTierId !== "ALL") {
        params.append("tierId", selectedTierId);
      }
      if (selectedStatus && selectedStatus !== "ALL") {
        params.append("status", selectedStatus);
      }
      if (searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }

      const res = await fetch(`/api/admin/buyers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch buyers data");
      const data = await res.json();

      setRecords(data.records || []);
      setSummary(
        data.summary || {
          totalPasses: 0,
          totalBuyers: 0,
          totalRevenue: 0,
          checkedInCount: 0,
          checkedInRate: 0,
        },
      );
      if (data.events) setEvents(data.events);
      if (data.tiers) setTiers(data.tiers);
    } catch (err) {
      console.error("Error fetching buyers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEventId, selectedTierId, selectedStatus]);

  // Filter available tiers dynamically based on selected event
  const availableTiersForEvent = useMemo(() => {
    if (!selectedEventId || selectedEventId === "ALL") {
      return tiers;
    }
    return tiers.filter((t) => t.eventId === selectedEventId);
  }, [tiers, selectedEventId]);

  // When event changes, if the selected tier is not in the new event, reset tier to ALL
  const handleEventChange = (newEventId: string) => {
    setSelectedEventId(newEventId);
    if (newEventId !== "ALL") {
      const tierMatches = tiers.some(
        (t) => t.eventId === newEventId && t.id === selectedTierId,
      );
      if (!tierMatches && selectedTierId !== "ALL") {
        setSelectedTierId("ALL");
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilters = () => {
    setSelectedEventId("ALL");
    setSelectedTierId("ALL");
    setSelectedStatus("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedEventId !== "ALL" ||
    selectedTierId !== "ALL" ||
    selectedStatus !== "ALL" ||
    searchQuery.trim().length > 0;

  // 1-Click Excel / CSV Export
  const handleExportExcel = () => {
    setIsExporting(true);
    const params = new URLSearchParams();
    if (selectedEventId && selectedEventId !== "ALL") {
      params.append("eventId", selectedEventId);
    }
    if (selectedTierId && selectedTierId !== "ALL") {
      params.append("tierId", selectedTierId);
    }
    if (selectedStatus && selectedStatus !== "ALL") {
      params.append("status", selectedStatus);
    }
    if (searchQuery.trim()) {
      params.append("q", searchQuery.trim());
    }

    // Direct browser file download
    window.location.href = `/api/admin/buyers/export?${params.toString()}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  // Copy emails for Meta Custom Audience / Mailchimp
  const handleCopyEmails = () => {
    const emails = Array.from(
      new Set(
        records
          .map((r) => r.customerEmail || r.attendeeEmail)
          .filter(Boolean) as string[],
      ),
    );
    if (emails.length === 0) return;
    navigator.clipboard.writeText(emails.join(", "));
    setCopyFeedback(`✓ Copied ${emails.length} unique emails to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Copy phone numbers for WhatsApp / SMS marketing
  const handleCopyPhones = () => {
    const phones = Array.from(
      new Set(records.map((r) => r.customerPhone).filter(Boolean) as string[]),
    );
    if (phones.length === 0) return;
    navigator.clipboard.writeText(phones.join("\n"));
    setCopyFeedback(`✓ Copied ${phones.length} phone numbers to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#FFD600]" />
            Marketing &amp; Audience CRM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Ticket Buyers &amp; Guests Database
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Comprehensive directory of festival ticket purchasers and individual
            pass holders. Filterable by event and tier, exportable to Excel for
            advertising and concierge outreach.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting
                ? "Preparing Excel..."
                : `Export to Excel (${records.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Copy feedback notification banner */}
      {copyFeedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Guest Passes
            </span>
            <Tag className="w-4 h-4 text-[#FF5722]" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {summary.totalPasses.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">
            Individual wristbands / QR passes
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Unique Buyers
            </span>
            <Users className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <p className="text-2xl font-black text-[#00E5FF] font-mono">
            {summary.totalBuyers.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">
            Distinct paying customer accounts
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Filtered Revenue
            </span>
            <DollarSign className="w-4 h-4 text-[#FFD600]" />
          </div>
          <p className="text-2xl font-black text-[#FFD600] font-mono">
            AED {summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">Confirmed paid orders</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Gate Check-in
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {summary.checkedInCount}
            </p>
            <span className="text-xs text-gray-400 font-mono">
              ({summary.checkedInRate}%)
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${summary.checkedInRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121524] border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 min-w-[240px]"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by buyer name, email, phone, ticket code, order #, city..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase"
            >
              Search
            </button>
          </form>

          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400 shrink-0 hidden sm:block">
              Event:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF] min-w-[160px]"
            >
              <option value="ALL">All Festival Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.city})
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter (Dynamically populated based on Event) */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400 shrink-0 hidden sm:block">
              Tier:
            </label>
            <select
              value={selectedTierId}
              onChange={(e) => setSelectedTierId(e.target.value)}
              className="bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD600] min-w-[180px]"
            >
              <option value="ALL">All Ticket Tiers</option>
              {availableTiersForEvent.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (
                  {t.paxPerUnit > 1 ? `${t.paxPerUnit} Pax` : "1 Guest"} •{" "}
                  {t.currency} {t.price})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400 shrink-0 hidden sm:block">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5722] min-w-[130px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid Orders</option>
              <option value="CHECKED_IN">Checked-In at Gate</option>
              <option value="VALID">Valid / Unscanned</option>
              <option value="PENDING">Pending Payment</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Marketing Quick-Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mr-1">
              Marketing Tools:
            </span>
            <button
              type="button"
              onClick={handleCopyEmails}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Copy deduplicated email addresses for Meta Custom Audiences or Mailchimp"
            >
              <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Copy All Emails</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPhones}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Copy phone numbers for WhatsApp or SMS outreach"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copy Phone Numbers</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1 text-xs font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-gray-400 text-xs">
            Showing{" "}
            <strong className="text-white font-mono">{records.length}</strong>{" "}
            records
          </div>
        </div>
      </div>

      {/* BUYERS & GUESTS DATA TABLE */}
      <div className="rounded-2xl border border-white/10 bg-[#121524] overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#FF5722] animate-spin" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Querying database records...
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <Users className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No records found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No ticket purchases or guests match your selected event, tier, or
              search criteria.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold inline-flex items-center gap-1.5 mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3.5 px-4">Buyer &amp; Contact</th>
                  <th className="py-3.5 px-4">Guest / Attendee</th>
                  <th className="py-3.5 px-4">Event &amp; City</th>
                  <th className="py-3.5 px-4">Ticket Tier &amp; Pax</th>
                  <th className="py-3.5 px-4">Ticket Pass Code</th>
                  <th className="py-3.5 px-4">Order / Spend</th>
                  <th className="py-3.5 px-4">Gate Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {records.map((r) => {
                  const isCheckedIn = r.ticketStatus === "CHECKED_IN";
                  const cleanPhone = (r.customerPhone || "").replace(
                    /[^0-9+]/g,
                    "",
                  );
                  const isVIP =
                    r.tierCategory === "table" ||
                    r.tierName.toLowerCase().includes("vip") ||
                    r.tierName.toLowerCase().includes("vvip");

                  return (
                    <tr
                      key={r.ticketId}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Buyer Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">
                          {r.customerName}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                          {r.customerEmail}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {r.customerPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              title="Open WhatsApp Chat"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>{r.customerPhone}</span>
                            </a>
                          )}
                          {r.customerLocation && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                              {r.customerLocation}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Guest / Attendee */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{r.attendeeName}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[160px]">
                          {r.attendeeEmail || r.customerEmail}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-200 block w-fit">
                          {r.eventName}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {r.eventCity}, {r.eventCountry}
                        </span>
                      </td>

                      {/* Ticket Tier */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {isVIP ? (
                            <Crown className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
                          ) : (
                            <Tag className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                          )}
                          <span className="truncate max-w-[150px]">
                            {r.tierName}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {r.paxPerUnit > 1
                            ? `${r.paxPerUnit} Guests Pass`
                            : "Single Admission"}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: r.tierColor || "#00E676",
                            }}
                          />
                          <span
                            className="text-[10px] font-black uppercase font-mono"
                            style={{ color: r.tierColor || "#00E676" }}
                          >
                            {r.wristbandColor || "NEON GREEN"}
                          </span>
                        </div>
                      </td>

                      {/* Ticket Code */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-white font-bold text-xs tracking-wider">
                          {r.ticketCode}
                        </span>
                      </td>

                      {/* Order & Spend */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-[#FFD600] font-mono">
                          {r.orderCurrency}{" "}
                          {Number(r.orderTotalAmount).toLocaleString()}
                        </div>
                        {r.isDeposit && (
                          <div className="mt-0.5">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[9px] uppercase">
                              20% Deposit
                            </span>
                            {Number(r.remainingBalance) > 0 && (
                              <div className="text-[10px] text-amber-200/90 font-mono mt-0.5">
                                Due: {r.orderCurrency}{" "}
                                {Number(r.remainingBalance).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          {r.orderNumber}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
                            r.orderStatus === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : r.orderStatus === "PENDING"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {r.orderStatus}
                        </span>
                      </td>

                      {/* Gate Status */}
                      <td className="py-3.5 px-4">
                        {isCheckedIn ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Checked In</span>
                            </span>
                            {r.checkedInAt && (
                              <p className="text-[10px] text-gray-400 font-mono">
                                {new Date(r.checkedInAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase">
                            <Clock className="w-3 h-3" />
                            <span>Valid / Not Scanned</span>
                          </span>
                        )}
                      </td>

                      {/* Action Links */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/tickets/${r.ticketCode}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                            title="View Verified Ticket Pass"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {r.customerPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
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

export default function AdminBuyersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#FF5722] animate-spin" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Loading Ticket Buyers CRM...
          </p>
        </div>
      }
    >
      <BuyersTableContent />
    </Suspense>
  );
}

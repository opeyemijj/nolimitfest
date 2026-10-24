"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Plus,
  RefreshCw,
  QrCode,
  DollarSign,
  Users,
  Receipt,
  Trash2,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

interface WalkInRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  currency: string;
  status: string;
  notes: string | null;
  createdAt: string;
  eventName: string;
  ticketsCount: number;
  tierName?: string;
  wristbandColor?: string;
  tierColor?: string;
}

export default function AdminWalkInsPage() {
  const [records, setRecords] = useState<WalkInRecord[]>([]);
  const [metrics, setMetrics] = useState({
    totalWalkIns: 0,
    pendingCount: 0,
    paidCount: 0,
    cancelledCount: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWalkIns, setTotalWalkIns] = useState(0);

  const fetchWalkIns = async (targetPage = currentPage) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/admin/walk-ins", window.location.origin);
      url.searchParams.set("page", targetPage.toString());
      url.searchParams.set("limit", "50");
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (searchQuery.trim()) url.searchParams.set("q", searchQuery.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setRecords(data.walkIns || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalWalkIns(data.pagination.total || 0);
          setCurrentPage(data.pagination.page || 1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch walk-ins:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchWalkIns(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWalkIns(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchWalkIns(newPage);
  };

  const handleDeleteWalkIn = async (record: WalkInRecord) => {
    if (
      !confirm(
        `Permanently delete walk-in order #${record.orderNumber} for ${record.customerName}? This will completely remove the order, recorded payment, and associated tickets from the system.`,
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/walk-ins/${record.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchWalkIns(currentPage);
      } else {
        alert(data.error || "Failed to delete walk-in order.");
      }
    } catch {
      alert("Network error deleting order.");
    }
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "WhatsApp Phone",
      "Tier",
      "Tickets Count",
      "Total Amount",
      "Currency",
      "Status",
      "Created At",
      "Notes",
    ];

    const rows = records.map((r) => [
      `"${r.orderNumber}"`,
      `"${r.customerName}"`,
      `"${r.customerEmail}"`,
      `"${r.customerPhone}"`,
      `"${r.tierName || "General Pass"}"`,
      r.ticketsCount || 1,
      r.totalAmount,
      r.currency,
      r.status,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `walk_in_guestlist_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePromptScanCode = () => {
    const input = prompt("Scan or enter Customer Walk-in Invoice Code (e.g. WALK-DUB-1234):");
    if (input && input.trim()) {
      window.location.href = `/admin/walk-ins/${encodeURIComponent(input.trim())}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-[#FF5722]" />
            <span>Walk-in Desk &amp; Gate Sales</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track walk-in entrance registrations, collect invoice payments at counter, and manage guestlist CRM data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePromptScanCode}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md font-mono"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Invoice QR</span>
          </button>

          <Link
            href="/walk-in"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>New Walk-in</span>
          </Link>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CRM</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Walk-ins */}
        <div className="p-4 rounded-2xl bg-[#121420] border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Total Walk-Ins</span>
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {metrics.totalWalkIns}
          </p>
        </div>

        {/* Pending at Counter */}
        <div className="p-4 rounded-2xl bg-[#121420] border border-amber-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Payment</span>
          </span>
          <p className="text-2xl font-black text-amber-300 font-mono">
            {metrics.pendingCount}
          </p>
        </div>

        {/* Paid & Admitted */}
        <div className="p-4 rounded-2xl bg-[#121420] border border-emerald-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid &amp; Admitted</span>
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {metrics.paidCount}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-[#121420] border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#FFD600]" />
            <span>Counter Revenue</span>
          </span>
          <p className="text-2xl font-black text-[#FFD600] font-mono">
            AED {metrics.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121420] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "PENDING", "PAID", "CANCELLED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-amber-400 text-black shadow-md"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#121420] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Pass &amp; Qty</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                    Loading walk-in registrations...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                    No walk-in registrations found matching your criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isPending = r.status === "PENDING";
                  const isPaid = r.status === "PAID";
                  const isCancelled = r.status === "CANCELLED" || r.status === "VOIDED";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold text-white">
                        <Link
                          href={`/admin/walk-ins/${r.id}`}
                          className="hover:text-amber-400 transition-colors"
                        >
                          {r.orderNumber}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">
                          {r.customerName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 font-sans">
                          <a
                            href={`https://wa.me/${r.customerPhone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{r.customerPhone}</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-gray-200 block">
                          {r.tierName || "Festival Pass"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {r.ticketsCount || 1} pass(es)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {r.currency} {Number(r.totalAmount).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase">
                            PAID
                          </span>
                        ) : isCancelled ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase">
                            CANCELLED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold uppercase animate-pulse">
                            PENDING
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/walk-ins/${r.id}`}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-all ${
                              isPending
                                ? "bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/20"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                          >
                            <span>{isPending ? "Collect" : "View"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteWalkIn(r)}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Walk-in Record & Tickets"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalWalkIns}
          pageSize={50}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

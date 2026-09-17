"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Download,
  Plus,
  Check,
  AlertCircle,
  Filter,
  ExternalLink,
  Crown,
  UserCheck,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);

  // Comp Form State
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [compNotes, setCompNotes] = useState("");
  const [compTierId, setCompTierId] = useState("tier-dxb-early-bird");
  const [compQty, setCompQty] = useState(1);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleResendEmail = async (orderId: string, email: string) => {
    if (
      !confirm(
        `Dispatch ticket confirmation email with scannable QR passes to ${email}?`,
      )
    ) {
      return;
    }
    setResendingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`✓ Confirmation email dispatched to ${email}`);
      } else {
        alert(data.error || data.message || "Failed to dispatch email.");
      }
    } catch {
      alert("Network error sending email.");
    } finally {
      setResendingOrderId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // Export Gate Manifest CSV
  const handleExportCsv = () => {
    if (orders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Location",
      "Total Amount",
      "Currency",
      "Status",
      "Tickets Count",
      "Checked In Count",
      "Date",
    ];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.customerLocation || ""}"`,
      o.totalAmount,
      o.currency,
      o.status,
      o.ticketsCount || 1,
      o.checkedInCount || 0,
      `"${o.createdAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `NLF_Gate_Manifest_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIssueComp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingComp(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "dubai-2026",
          tierId: compTierId,
          guestName,
          guestEmail,
          guestPhone,
          notes: compNotes,
          quantity: compQty,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification(`Complimentary pass issued! Ref: ${data.orderNumber}`);
        setIsCompModalOpen(false);
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
        fetchOrders();
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert(data.error || "Failed to issue comp pass.");
      }
    } catch {
      alert("Error contacting server.");
    } finally {
      setIsSubmittingComp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
            Guestlist &amp; Ticketing Data
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Orders &amp; Attendees
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Search orders, inspect guestlist check-in rates, export door
            manifests, or allocate comp passes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Gate Manifest (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCompModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Comp Pass</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full sm:max-w-md"
        >
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, order or ticket code..."
            className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "PAID", "PENDING"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? "bg-[#FF5722] text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            No orders found matching your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer / Guest</th>
                  <th className="py-3 px-3">Passes</th>
                  <th className="py-3 px-3">Check-In Status</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Passes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => (
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
                      {ord.customerPhone && (
                        <div className="text-[10px] text-gray-500">
                          {ord.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-gray-300">
                      {ord.ticketsCount || 1} pass(es)
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] text-gray-300">
                        <strong className="text-emerald-400">
                          {ord.checkedInCount || 0}
                        </strong>{" "}
                        / {ord.ticketsCount || 1} Checked In
                      </span>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={resendingOrderId === ord.id}
                          onClick={() =>
                            handleResendEmail(ord.id, ord.customerEmail)
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white inline-flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                          title={`Resend passes to ${ord.customerEmail}`}
                        >
                          <Mail className="w-3 h-3 text-[#FF5722]" />
                          <span className="hidden sm:inline">
                            {resendingOrderId === ord.id
                              ? "Sending..."
                              : "Resend Email"}
                          </span>
                        </button>
                        <Link
                          href={`/orders/${ord.id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#00E5FF] hover:text-white inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Passes</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMP PASS MODAL */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722]">
                  Guest Allocation
                </span>
                <h3 className="text-xl font-black text-white">
                  Issue Complimentary Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueComp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. VIP Artist / Sponsor Representative"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="vip@example.com"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Pass Category
                  </label>
                  <select
                    value={compTierId}
                    onChange={(e) => setCompTierId(e.target.value)}
                    className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="tier-dxb-early-bird">
                      General Admission Pass
                    </option>
                    <option value="tier-dxb-table-8">VIP Table for 8</option>
                    <option value="tier-dxb-table-vvip-dj">
                      ★ VVIP Back of DJ Cabana ★
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={compQty}
                    onChange={(e) =>
                      setCompQty(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Internal Reference / Allocation Notes
                </label>
                <textarea
                  rows={2}
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  placeholder="e.g. Media partner guest / Headliner family allocation..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCompModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComp}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingComp ? "Issuing..." : "Issue Pass"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

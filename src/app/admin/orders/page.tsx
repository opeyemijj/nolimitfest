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
  Ban,
  ShieldAlert,
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

  // Void Modal State
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidingOrder, setVoidingOrder] = useState<any>(null);
  const [voidReasonCategory, setVoidReasonCategory] = useState("Stripe Cardholder Dispute / Chargeback");
  const [voidCustomReason, setVoidCustomReason] = useState("");
  const [voidReleaseInventory, setVoidReleaseInventory] = useState(true);
  const [voidNotifyCustomer, setVoidNotifyCustomer] = useState(true);
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

  const openVoidModal = (ord: any) => {
    setVoidingOrder(ord);
    setVoidReasonCategory("Stripe Cardholder Dispute / Chargeback");
    setVoidCustomReason("");
    setVoidReleaseInventory(true);
    setVoidNotifyCustomer(true);
    setIsVoidModalOpen(true);
  };

  const handleVoidOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingOrder) return;

    const fullReason = voidCustomReason.trim()
      ? `${voidReasonCategory} — ${voidCustomReason.trim()}`
      : voidReasonCategory;

    setIsSubmittingVoid(true);
    try {
      const res = await fetch(`/api/admin/orders/${voidingOrder.id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: fullReason,
          releaseInventory: voidReleaseInventory,
          notifyCustomer: voidNotifyCustomer,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`✓ Order #${voidingOrder.orderNumber} successfully voided`);
        setIsVoidModalOpen(false);
        setVoidingOrder(null);
        fetchOrders();
      } else {
        alert(data.error || "Failed to void order.");
      }
    } catch {
      alert("Network error voiding order.");
    } finally {
      setIsSubmittingVoid(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

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

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {["ALL", "PAID", "COMPLIMENTARY", "DISPUTED", "VOIDED", "PENDING"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? "bg-[#FF5722] text-white shadow-md shadow-orange-500/20"
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
                  <th className="py-3 px-3 text-right">Actions</th>
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
                      {ord.status === "COMPLIMENTARY" ||
                      ord.status === "COMPLEMENTARY" ||
                      ord.orderNumber.startsWith("COMP-")
                        ? "COMP (AED 0)"
                        : `${ord.currency} ${ord.totalAmount?.toLocaleString()}`}
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            ord.status === "COMPLIMENTARY" ||
                            ord.status === "COMPLEMENTARY" ||
                            ord.orderNumber.startsWith("COMP-")
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : ord.status === "DISPUTED"
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : ord.status === "VOIDED" || ord.status === "REFUNDED" || ord.status === "CANCELLED"
                                  ? "bg-red-950/60 text-red-400 border border-red-500/30"
                                  : ord.status === "PAID"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {ord.status === "DISPUTED" && (
                            <ShieldAlert className="w-3 h-3 text-red-400" />
                          )}
                          {(ord.status === "VOIDED" || ord.status === "CANCELLED") && (
                            <Ban className="w-3 h-3 text-red-400" />
                          )}
                          <span>
                            {ord.orderNumber.startsWith("COMP-")
                              ? "COMPLIMENTARY"
                              : ord.status}
                          </span>
                        </span>
                        {(ord.voidReason || ord.disputeReason) && (
                          <p
                            className="text-[10px] text-red-400/90 mt-1 max-w-[200px] truncate"
                            title={ord.voidReason || ord.disputeReason}
                          >
                            {ord.voidReason || ord.disputeReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status !== "VOIDED" &&
                          ord.status !== "CANCELLED" &&
                          ord.status !== "DISPUTED" && (
                            <button
                              type="button"
                              onClick={() => openVoidModal(ord)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Void tickets with reason"
                            >
                              <Ban className="w-3 h-3" />
                              <span className="hidden sm:inline">Void</span>
                            </button>
                          )}
                        <button
                          type="button"
                          disabled={
                            resendingOrderId === ord.id ||
                            ord.status === "VOIDED" ||
                            ord.status === "CANCELLED" ||
                            ord.status === "DISPUTED"
                          }
                          onClick={() =>
                            handleResendEmail(ord.id, ord.customerEmail)
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white inline-flex items-center gap-1 transition-colors disabled:opacity-30 cursor-pointer"
                          title={`Resend passes to ${ord.customerEmail}`}
                        >
                          <Mail className="w-3 h-3 text-[#FF5722]" />
                          <span className="hidden sm:inline">
                            {resendingOrderId === ord.id
                              ? "Sending..."
                              : "Resend"}
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

      {/* VOID ORDER & TICKETS MODAL */}
      {isVoidModalOpen && voidingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#121524] border border-red-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Void Order &amp; Revoke Passes
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Order #{voidingOrder.orderNumber} • {voidingOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Gate Invalidation Warning</span>
              </p>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                All {voidingOrder.ticketsCount || 1} digital QR entrance pass(es) associated with this order will be permanently deactivated. Any attempt to scan these passes at festival entrance gates will be rejected with an audible warning.
              </p>
            </div>

            <form onSubmit={handleVoidOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Primary Void Reason <span className="text-red-400">*</span>
                </label>
                <select
                  value={voidReasonCategory}
                  onChange={(e) => setVoidReasonCategory(e.target.value)}
                  className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="Stripe Cardholder Dispute / Chargeback">
                    Stripe Cardholder Dispute / Chargeback (Stolen card or unauthorized transaction)
                  </option>
                  <option value="Suspected Card Fraud / Unauthorized Buyer">
                    Suspected Card Fraud / High Risk Unauthorized Transaction
                  </option>
                  <option value="Customer Cancellation & Refund Request">
                    Customer Cancellation &amp; Refund Approved
                  </option>
                  <option value="Duplicate Order Invalidation">
                    Duplicate Order Invalidation
                  </option>
                  <option value="Festival Box Office Admin Decision">
                    Festival Box Office / Security Revocation
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Additional Reason Details / Case Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={voidCustomReason}
                  onChange={(e) => setVoidCustomReason(e.target.value)}
                  placeholder="e.g. Bank dispute ID dp_1N... or cardholder email claiming unauthorized transaction"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voidReleaseInventory}
                    onChange={(e) => setVoidReleaseInventory(e.target.checked)}
                    className="mt-0.5 rounded border-gray-600 text-[#FF5722] focus:ring-0"
                  />
                  <span className="text-gray-300 text-[11px] leading-snug">
                    <strong>Release Ticket Inventory:</strong> Decrement sold count so tickets can be purchased by genuine festival attendees.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voidNotifyCustomer}
                    onChange={(e) => setVoidNotifyCustomer(e.target.checked)}
                    className="mt-0.5 rounded border-gray-600 text-[#FF5722] focus:ring-0"
                  />
                  <span className="text-gray-300 text-[11px] leading-snug">
                    <strong>Send Invalidation Email:</strong> Dispatch official revocation notice to {voidingOrder.customerEmail} detailing that their passes are voided.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsVoidModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVoid}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isSubmittingVoid ? "Voiding Passes..." : "Confirm Void Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

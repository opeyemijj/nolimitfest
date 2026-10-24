"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Mail,
  Ticket,
  DollarSign,
  CreditCard,
  Ban,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Trash2,
} from "lucide-react";

export default function AdminWalkInDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card POS Terminal" | "Other">("Cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/walk-ins/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        setTickets(data.tickets || []);
      } else {
        setErrorMessage(data.error || "Walk-in order not found.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load order.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const handleMarkAsPaid = async () => {
    if (!confirm(`Confirm collection of ${order.currency} ${order.totalAmount} via ${paymentMethod}?`)) {
      return;
    }

    setIsProcessing(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/walk-ins/${order.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process payment.");
      }

      setActionSuccess("Payment successfully recorded! Official festival passes activated.");
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || "Error processing payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt("Enter cancellation reason:", "Customer decided not to purchase");
    if (!reason) return;

    setIsProcessing(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/walk-ins/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel order.");
      }

      setActionSuccess("Order has been cancelled.");
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || "Error cancelling order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (
      !confirm(
        `Permanently delete walk-in order #${order.orderNumber} for ${order.customerName}? This will completely remove the order record, recorded payment, and associated tickets from the database.`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/walk-ins/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Order deleted successfully.");
        router.push("/admin/walk-ins");
      } else {
        alert(data.error || "Failed to delete order.");
      }
    } catch {
      alert("Network error deleting order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090E] text-white p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-mono">Loading walk-in invoice...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="min-h-screen bg-[#08090E] text-white p-6 max-w-lg mx-auto flex flex-col justify-center">
        <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Invoice Not Found</h2>
          <p className="text-xs text-gray-300">{errorMessage || "Invalid walk-in invoice reference."}</p>
          <Link
            href="/admin/walk-ins"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Walk-in Desk</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = order.status === "PENDING";
  const isPaid = order.status === "PAID";
  const isCancelled = order.status === "CANCELLED" || order.status === "VOIDED";

  const totalAmount = Number(order.totalAmount || 0);
  const basePrice = Math.round((totalAmount / 1.05) * 100) / 100;
  const serviceCharge = Math.round((totalAmount - basePrice) * 100) / 100;
  const currency = order.currency || "AED";

  return (
    <div className="min-h-screen bg-[#08090E] text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/walk-ins"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Walk-in Desk</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-gray-400">
              {order.orderNumber}
            </span>
            <button
              type="button"
              onClick={handleDeleteOrder}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Delete Walk-in Order Record & Tickets"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 text-xs flex items-center gap-2.5 shadow-xl animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{actionSuccess}</span>
          </div>
        )}

        {/* Status Card */}
        <div className="p-6 rounded-3xl bg-[#121420] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Cashier Gate Verification
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white font-mono">
                Order #{order.orderNumber}
              </h1>
            </div>

            {isPaid ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-black uppercase font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PAID • TICKETS ACTIVE</span>
              </span>
            ) : isCancelled ? (
              <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-red-300 text-xs font-black uppercase font-mono flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5" />
                <span>CANCELLED</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 text-xs font-black uppercase font-mono flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>PENDING PAYMENT</span>
              </span>
            )}
          </div>

          {/* Customer Profile */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Customer Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
              <div>
                <span className="text-[10px] text-gray-500 block">Full Name</span>
                <span className="font-bold text-white text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">WhatsApp</span>
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>{order.customerPhone}</span>
                </a>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Email</span>
                <span className="font-bold text-gray-300 truncate block">{order.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Amount Due Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/20 border-2 border-amber-400/90 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-300">
                Total Collection Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {currency} {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-center justify-between font-mono">
              <span>Passes: <strong>{currency} {basePrice.toLocaleString()}</strong></span>
              <span>5% Charges: <strong>{currency} {serviceCharge.toLocaleString()}</strong></span>
              <span className="text-white font-bold">Total: <strong>{currency} {totalAmount.toLocaleString()}</strong></span>
            </div>

            {order.notes && (
              <p className="text-[11px] text-amber-200/80 leading-relaxed font-mono">
                {order.notes}
              </p>
            )}
          </div>

          {/* Payment Method Selector & Actions (If Pending) */}
          {isPending && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-300 block">
                  Select Payment Method Used by Customer:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash", "Card POS Terminal", "Other"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                        paymentMethod === method
                          ? "bg-amber-400 text-black border-amber-400 font-black shadow-lg"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {method === "Cash" ? (
                        <DollarSign className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleMarkAsPaid}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-mono"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mark as Paid &amp; Issue Passes</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCancelOrder}
                  className="w-full py-4 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500 text-red-300 font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-mono"
                >
                  <Ban className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>
          )}

          {/* If Paid: Show Activated Tickets and Wristband Color */}
          {isPaid && tickets.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-xs font-black uppercase text-emerald-400 block tracking-wider">
                Issued Festival Passes ({tickets.length})
              </span>

              <div className="space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.ticketId || t.ticketCode}
                    className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-sm block">
                        {t.tierName || "Pass"} • {t.attendeeName}
                      </span>
                      <span className="text-xs font-mono text-[#00E5FF] block">
                        Code: {t.ticketCode}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border block"
                        style={{
                          backgroundColor: `${t.tierColor || "#00E676"}25`,
                          borderColor: t.tierColor || "#00E676",
                          color: t.tierColor || "#00E676",
                        }}
                      >
                        {t.wristbandColor || "WRISTBAND"}
                      </span>
                      <Link
                        href={`/tickets/${t.ticketCode}`}
                        target="_blank"
                        className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 justify-end"
                      >
                        <span>Open Pass</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

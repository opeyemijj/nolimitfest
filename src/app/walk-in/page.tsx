"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Ticket,
  User,
  Mail,
  Phone,
  Flame,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowRight,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { calculateServiceFee, SERVICE_FEE_LABEL } from "@/lib/fees";

interface Tier {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  capacity: number;
  soldCount?: number;
  paxPerUnit?: number;
  color?: string;
  badge?: string;
  perks?: string[];
}

export default function WalkInRegistrationPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch available tiers
  useEffect(() => {
    async function loadTiers() {
      try {
        const res = await fetch("/api/admin/tickets?eventId=dubai-2026").catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data.tiers)) {
            setTiers(data.tiers);
            const firstAvailable = data.tiers.find(
              (t: Tier) => t.status === "active",
            );
            if (firstAvailable) {
              setSelectedTierId(firstAvailable.id);
            }
            return;
          }
        }

        // Fallback default tiers if not authenticated or loading fails
        const fallback: Tier[] = [
          {
            id: "tier-dxb-phase-3",
            name: "Phase 3 General Admission",
            category: "phase",
            price: 200,
            currency: "AED",
            status: "active",
            capacity: 500,
            badge: "SELLING FAST",
          },
          {
            id: "tier-dxb-squad-4",
            name: "Squad Pack (4 Passes)",
            category: "group",
            price: 550,
            currency: "AED",
            status: "active",
            capacity: 200,
            badge: "GROUP SAVER",
          },
          {
            id: "tier-dxb-table-4",
            name: "VIP Standing Table (4 Pax)",
            category: "table",
            price: 2000,
            currency: "AED",
            status: "active",
            capacity: 25,
            badge: "VIP ZONE",
          },
        ];
        setTiers(fallback);
        setSelectedTierId(fallback[0].id);
      } catch (e) {
        console.error("Error loading tiers for walk-in form:", e);
      } finally {
        setIsLoadingTiers(false);
      }
    }
    loadTiers();
  }, []);

  const selectedTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];
  const unitPrice = selectedTier ? Number(selectedTier.price) : 0;
  const subtotal = unitPrice * quantity;
  const serviceFee = calculateServiceFee(subtotal);
  const totalAmount = Math.round((subtotal + serviceFee) * 100) / 100;
  const currency = selectedTier?.currency || "AED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 7) {
      setErrorMessage("Please enter your WhatsApp phone number.");
      return;
    }
    if (!selectedTierId) {
      setErrorMessage("Please select a ticket tier.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "dubai-2026",
          customerName: fullName.trim(),
          customerEmail: email.trim().toLowerCase(),
          customerPhone: whatsapp.trim(),
          tierId: selectedTierId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create walk-in registration.");
      }

      // Success: redirect to invoice screen
      router.push(data.invoiceUrl || `/walk-in/invoice/${data.orderId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-white pt-20 pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Glow Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FF5722]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FF5722]/20 to-[#FFD600]/20 border border-[#FF5722]/30 text-[#FFD600] text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-[#FF5722] animate-bounce" />
            <span>Entrance Fast-Track</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-mono">
            Walk-in Guest Registration
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Arriving without a pre-booked ticket? Fill out this quick 30-second form, receive your instant invoice, and proceed to the cashier counter to pay and get your wristband.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-7 rounded-3xl bg-[#121420]/95 backdrop-blur-xl border border-white/10 shadow-2xl space-y-5"
        >
          {/* Customer Details */}
          <div className="space-y-3.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#FF5722]" />
              <span>1. Guest Contact Information</span>
            </h2>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ahmed Al Mansoori"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-[#FF5722] focus:outline-none text-white text-sm placeholder-gray-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Email Address * (For Digital Pass Delivery)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ahmed@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-[#00E5FF] focus:outline-none text-white text-sm placeholder-gray-500 transition-colors"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                WhatsApp Phone Number * (With Country Code)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. +971 50 123 4567"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-emerald-400 focus:outline-none text-white text-sm placeholder-gray-500 font-mono transition-colors"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                Include country prefix (e.g. +971 for UAE, +44 for UK, +234 for Nigeria).
              </span>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="space-y-3.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#FFD600]" />
                <span>2. Select Festival Ticket Tier</span>
              </h2>
              <span className="text-[10px] text-gray-400">Live Inventory</span>
            </div>

            {isLoadingTiers ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                Loading live ticket tiers...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {tiers.map((t) => {
                  const isSoldOut = t.status === "sold_out";
                  const isSelected = selectedTierId === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => setSelectedTierId(t.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSoldOut
                          ? "bg-black/30 border-white/5 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "bg-gradient-to-r from-[#FF5722]/20 to-[#FFD600]/15 border-[#FF5722] shadow-lg shadow-orange-500/15"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {t.name}
                          </span>
                          {t.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF6E40] text-[9px] font-black uppercase">
                              {t.badge}
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black uppercase">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 block font-mono">
                          {t.category === "table" ? "Table Hospitality Pass" : "Festival Admission Pass"}
                        </span>
                      </div>

                      <div className="text-right pl-3">
                        <span className="text-base font-black text-white font-mono block">
                          {t.currency} {Number(t.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 block">per pass</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity Stepper */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-300 block">Pass Quantity</span>
              <span className="text-[10px] text-gray-500">Max 10 passes per registration</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-mono font-black text-lg text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instant Cost Summary with 5% Charges */}
          <div className="p-4 rounded-2xl bg-[#0C0E18] border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{quantity}x {selectedTier?.name || "Pass"}</span>
              <span className="font-mono">{currency} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span>5% Service &amp; Entrance Charges</span>
              </span>
              <span className="font-mono text-amber-300">+{currency} {serviceFee.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm font-black uppercase text-white">Total Invoice Amount</span>
              <span className="text-xl font-black font-mono text-[#00E5FF]">
                {currency} {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#FF5722] text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-mono"
          >
            {isSubmitting ? (
              <span>Generating Walk-in Invoice...</span>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Generate Invoice • Proceed to Payment Desk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Payment accepted at entrance counter: <strong>Cash</strong> or <strong>Card POS Terminal</strong>. Your official digital pass and wristband will be issued upon payment verification.
          </p>
        </form>

        {/* Gate Signboard QR Link */}
        <div className="text-center">
          <Link
            href="/walk-in/qr"
            className="inline-flex items-center gap-1.5 text-xs text-[#00E5FF] hover:underline font-mono"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Gate QR Signboard (For Entrance Display)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

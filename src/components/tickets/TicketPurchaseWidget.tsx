"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Check,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Crown,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Flame,
  Minus,
  Plus,
  Info,
  X,
  Percent,
} from "lucide-react";
import { DbEvent, DbTicketTier } from "@/lib/data-service";

interface TicketPurchaseWidgetProps {
  event: DbEvent;
  tiers: DbTicketTier[];
}

export default function TicketPurchaseWidget({
  event,
  tiers,
}: TicketPurchaseWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "phase" | "group" | "table"
  >("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isDepositMode, setIsDepositMode] = useState<Record<string, boolean>>(
    {},
  );
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when any modal is open & handle Escape key
  useEffect(() => {
    const isAnyModalOpen = showCheckoutModal || showPhaseModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCheckoutModal(false);
        setShowPhaseModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCheckoutModal, showPhaseModal]);

  // 1. Identify all GA phase tiers
  const phaseTiers = tiers
    .filter((t) => t.category === "phase" && t.status !== "hidden")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Find current active phase tier (or earliest upcoming if none active)
  const activePhaseTier =
    phaseTiers.find((t) => t.status === "active") || phaseTiers[0];

  // Find the next upcoming phase tier for price alerts
  const upcomingPhaseTiers = phaseTiers.filter(
    (t) => t.sortOrder > (activePhaseTier?.sortOrder ?? -1),
  );
  const nextPhaseTier =
    upcomingPhaseTiers.length > 0 ? upcomingPhaseTiers[0] : null;

  // 2. Deduplicate tiers: hide future upcoming phase duplicates to eliminate repetition
  const deduplicatedTiers = tiers.filter((tier) => {
    if (tier.status === "hidden") return false;
    if (tier.category === "phase" && activePhaseTier) {
      return tier.id === activePhaseTier.id;
    }
    return true;
  });

  // 3. Category filters
  const filteredTiers = deduplicatedTiers.filter((tier) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "phase") return tier.category === "phase";
    if (selectedCategory === "group") return tier.category === "group";
    if (selectedCategory === "table")
      return tier.category === "table" || tier.category === "vvip";
    return true;
  });

  const handleQuantityChange = (tierId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] !== undefined ? prev[tierId] : 1;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [tierId]: next };
    });
  };

  const handleDirectBuy = (tierId: string, withDeposit: boolean = false) => {
    const qty = quantities[tierId] !== undefined ? quantities[tierId] : 1;
    setQuantities({ [tierId]: qty });
    setIsDepositMode({ [tierId]: withDeposit });
    setShowCheckoutModal(true);
  };

  // Has at least one table pass with deposit selected
  const hasDepositSelected = Object.entries(quantities).some(
    ([tierId, qty]) => {
      if (qty <= 0) return false;
      const t = tiers.find((tier) => tier.id === tierId);
      return isDepositMode[tierId] && (t?.category === "table" || t?.isVVIP);
    },
  );

  // Calculate order totals
  const totalItemsCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  // Full price of all items selected
  const fullTotalAmount = Object.entries(quantities).reduce(
    (sum, [tierId, qty]) => {
      const tier = tiers.find((t) => t.id === tierId);
      return sum + (tier ? tier.price * qty : 0);
    },
    0,
  );

  // Charge amount (accounting for 20% deposit on tables when enabled)
  const payableAmount = Object.entries(quantities).reduce(
    (sum, [tierId, qty]) => {
      const tier = tiers.find((t) => t.id === tierId);
      if (!tier) return sum;
      const isTable = tier.category === "table" || tier.isVVIP;
      if (isTable && isDepositMode[tierId] && (tier.allowDeposit ?? true)) {
        const pct = tier.depositPercentage ?? 20;
        return sum + Math.round((tier.price * qty * pct) / 100);
      }
      return sum + tier.price * qty;
    },
    0,
  );

  const remainingBalance = Math.max(0, fullTotalAmount - payableAmount);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      alert(
        "Please confirm you are 21 years of age or older (valid ID required at entrance).",
      );
      return;
    }

    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, qty]) => ({
        tierId,
        quantity: qty,
      }));

    if (orderItems.length === 0) {
      alert("Please select at least one ticket pass.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          items: orderItems,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          customerLocation: location,
          notes,
          isDeposit: hasDepositSelected,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else if (res.ok && data.orderNumber) {
        window.location.href = `/tickets/${data.orderNumber}?success=true`;
      } else {
        setErrorMessage(
          data.error || "Unable to initialize checkout. Please try again.",
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Checkout connection error. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#0E111C] border border-white/10 overflow-hidden shadow-2xl">
      {/* Event Header Banner - Mobile Responsive */}
      <div className="relative h-40 xs:h-48 sm:h-64 w-full bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-blue-950/40 border-b border-white/10">
        <Image
          src={event.heroImage || "/images/banner.png"}
          alt={event.name}
          fill
          className="object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E111C] via-[#0E111C]/60 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 xs:top-4 sm:top-6 left-3 xs:left-4 sm:left-6 right-3 xs:right-4 sm:right-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 xs:gap-2">
            <span className="text-2xl xs:text-3xl sm:text-4xl drop-shadow-lg">
              {event.flag}
            </span>
            <span className="px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] xs:text-xs font-black uppercase text-white truncate max-w-[150px] xs:max-w-none">
              {event.city}, {event.country}
            </span>
          </div>

          <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#FF5722] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg animate-pulse shrink-0">
            Official Tickets
          </span>
        </div>

        {/* Bottom Banner Title */}
        <div className="absolute bottom-3 xs:bottom-4 sm:bottom-6 left-3 xs:left-4 sm:left-6 right-3 xs:right-4 sm:right-6">
          <span className="text-[10px] xs:text-xs font-black uppercase tracking-widest text-[#00E5FF]">
            {event.edition}
          </span>
          <h2 className="text-xl xs:text-2xl sm:text-4xl font-black text-white uppercase tracking-tight truncate">
            {event.name}
          </h2>
          <p className="text-[11px] xs:text-xs sm:text-sm text-[#FFD600] font-semibold mt-0.5 truncate">
            {event.tagline}
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="p-3.5 xs:p-5 sm:p-8 space-y-5 sm:space-y-6">
        {/* Quick Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 text-xs">
          <div className="p-2.5 xs:p-3.5 rounded-xl xs:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#FF5722] shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-400 text-[9px] xs:text-[10px]">Date</p>
              <p className="font-bold text-white text-[11px] xs:text-xs truncate">
                {event.dates}
              </p>
            </div>
          </div>
          <div className="p-2.5 xs:p-3.5 rounded-xl xs:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#00E5FF] shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-400 text-[9px] xs:text-[10px]">Venue</p>
              <p className="font-bold text-white text-[11px] xs:text-xs truncate">
                {event.venue}
              </p>
            </div>
          </div>
          <div className="p-2.5 xs:p-3.5 rounded-xl xs:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#FFD600] shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-400 text-[9px] xs:text-[10px]">
                Headliner
              </p>
              <p className="font-bold text-white text-[11px] xs:text-xs truncate">
                RUGER Live
              </p>
            </div>
          </div>
          <div className="p-2.5 xs:p-3.5 rounded-xl xs:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-400 text-[9px] xs:text-[10px]">
                Security
              </p>
              <p className="font-bold text-white text-[11px] xs:text-xs truncate">
                Stripe Verified
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Mobile friendly swipeable bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 pt-1 -mx-2 px-2 no-scrollbar">
          {[
            { id: "all", label: "All Passes" },
            { id: "phase", label: "General Admission" },
            { id: "group", label: "Squad Packs" },
            { id: "table", label: "VIP Tables & Cabanas" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 xs:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/20 scale-105"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* TIERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTiers.map((tier) => {
            const cardQty = quantities[tier.id] || 1;
            const isSoldOut =
              tier.status === "sold_out" || tier.capacity - tier.soldCount <= 0;
            const isUpcoming = tier.status === "upcoming";
            const isPhase = tier.category === "phase";
            const isTable = tier.category === "table" || tier.isVVIP;
            const allowsDeposit = isTable && (tier.allowDeposit ?? true);
            const depositPct = tier.depositPercentage ?? 20;
            const depositUnitAmount = Math.round(
              (tier.price * depositPct) / 100,
            );
            const cardIsDeposit =
              isDepositMode[tier.id] ?? (allowsDeposit ? true : false);

            return (
              <div
                key={tier.id}
                className={`rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 border flex flex-col justify-between transition-all relative ${
                  tier.popular || tier.badge?.includes("POPULAR")
                    ? "bg-[#181D33] border-[#FF5722] shadow-2xl shadow-orange-500/15 ring-1 ring-[#FF5722]/40"
                    : "bg-[#131626] border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: tier.color || "#00E676" }}
                      />
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-wider">
                        {tier.paxPerUnit}{" "}
                        {tier.paxPerUnit === 1 ? "Guest Pass" : "Guests Pass"}
                      </span>
                    </div>
                    {tier.badge && (
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black text-[10px] font-black uppercase tracking-wider">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg xs:text-xl font-black text-white flex items-center gap-2">
                    {tier.category === "table" || tier.isVVIP ? (
                      <Crown className="w-4 h-4 text-[#FFD600] shrink-0" />
                    ) : tier.category === "group" ? (
                      <Users className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-[#FF5722] shrink-0" />
                    )}
                    <span className="truncate">{tier.name}</span>
                  </h4>

                  {/* Price Section */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-2xl xs:text-3xl font-black text-[#FFD600] font-mono">
                      {tier.currency} {tier.price.toLocaleString()}
                    </span>
                    {allowsDeposit && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Percent className="w-3 h-3 text-amber-400" />
                        <span>{depositPct}% Deposit Available</span>
                      </span>
                    )}
                  </div>

                  {/* Wristband Color Indicator */}
                  {tier.wristbandColor && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider font-mono opacity-90"
                        style={{ color: tier.color || "#00E676" }}
                      >
                        ● {tier.wristbandColor} Wristband Entry
                      </span>
                    </div>
                  )}

                  {/* Next Phase Indicator on GA Card */}
                  {isPhase && nextPhaseTier && (
                    <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-[#FF5722]/15 via-amber-500/10 to-transparent border border-[#FF5722]/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-300">
                        <Flame className="w-3.5 h-3.5 text-[#FF5722] shrink-0 animate-pulse" />
                        <span>
                          Next: {nextPhaseTier.name} ({nextPhaseTier.currency}{" "}
                          {nextPhaseTier.price})
                        </span>
                      </div>
                      {phaseTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowPhaseModal(true)}
                          className="text-[10px] text-[#00E5FF] hover:underline font-bold flex items-center gap-0.5 ml-2 shrink-0"
                        >
                          <Info className="w-3 h-3" />
                          <span>Roadmap</span>
                        </button>
                      )}
                    </div>
                  )}

                  {tier.description && (
                    <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                      {tier.description}
                    </p>
                  )}

                  <ul className="mt-4 space-y-1.5 text-xs text-gray-300">
                    {tier.perks.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug text-[11px] text-gray-300">
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action Area: Quantity Stepper & Buy Now Button Under Each Ticket */}
                <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                  {isSoldOut ? (
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs uppercase cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  ) : isUpcoming ? (
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-xs uppercase cursor-not-allowed"
                    >
                      Upcoming Release
                    </button>
                  ) : (
                    <>
                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Quantity:
                        </span>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(tier.id, -1)}
                            disabled={cardQty <= 1}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-sm text-white">
                            {cardQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(tier.id, 1)}
                            className="w-7 h-7 rounded-lg bg-[#FF5722] hover:bg-[#FF6E40] text-white flex items-center justify-center transition-colors shadow-md shadow-orange-500/20"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Payment Options & CTA Button */}
                      {allowsDeposit ? (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>Payment Option:</span>
                            <span className="text-[#FFD600] font-mono text-[10px]">
                              {cardIsDeposit ? `${depositPct}% Deposit Selected` : "Full Payment Selected"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Option 1: Deposit to hold booking */}
                            <button
                              type="button"
                              onClick={() =>
                                setIsDepositMode((prev) => ({
                                  ...prev,
                                  [tier.id]: true,
                                }))
                              }
                              className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                                cardIsDeposit
                                  ? "bg-amber-500/20 border-[#FFD600] text-white shadow-lg ring-1 ring-[#FFD600]"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider ${
                                    cardIsDeposit
                                      ? "text-amber-300"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {depositPct}% Deposit
                                </span>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    cardIsDeposit
                                      ? "border-[#FFD600] bg-[#FFD600]"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {cardIsDeposit && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-1 font-mono font-black text-sm text-white">
                                {tier.currency}{" "}
                                {(depositUnitAmount * cardQty).toLocaleString()}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                                Hold the booking
                              </p>
                            </button>

                            {/* Option 2: Pay full amount */}
                            <button
                              type="button"
                              onClick={() =>
                                setIsDepositMode((prev) => ({
                                  ...prev,
                                  [tier.id]: false,
                                }))
                              }
                              className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                                !cardIsDeposit
                                  ? "bg-[#FF5722]/20 border-[#FF5722] text-white shadow-lg ring-1 ring-[#FF5722]"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider ${
                                    !cardIsDeposit
                                      ? "text-orange-300"
                                      : "text-gray-400"
                                  }`}
                                >
                                  Full Amount
                                </span>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    !cardIsDeposit
                                      ? "border-[#FF5722] bg-[#FF5722]"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {!cardIsDeposit && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-1 font-mono font-black text-sm text-white">
                                {tier.currency}{" "}
                                {(tier.price * cardQty).toLocaleString()}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                                Pay 100% upfront
                              </p>
                            </button>
                          </div>

                          {cardIsDeposit && (
                            <p className="text-[10px] text-amber-200/90 italic text-center px-1">
                              ⚡ Pay {depositPct}% now to hold the booking. Remaining{" "}
                              {tier.currency}{" "}
                              {(
                                (tier.price - depositUnitAmount) *
                                cardQty
                              ).toLocaleString()}{" "}
                              payable upon entrance check-in.
                            </p>
                          )}

                          {/* Primary CTA Button for Tables */}
                          <button
                            type="button"
                            onClick={() => handleDirectBuy(tier.id, cardIsDeposit)}
                            className={`w-full py-3.5 px-4 rounded-xl text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all ${
                              cardIsDeposit
                                ? "bg-gradient-to-r from-amber-500 via-[#FFD600] to-yellow-400 shadow-amber-500/25"
                                : "bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] shadow-orange-500/25"
                            }`}
                          >
                            <CreditCard className="w-4 h-4 text-black shrink-0" />
                            <span className="truncate">
                              {cardIsDeposit
                                ? `Hold Booking • Pay ${depositPct}% Deposit (${tier.currency} ${(depositUnitAmount * cardQty).toLocaleString()})`
                                : `Pay Full Amount • ${tier.currency} ${(tier.price * cardQty).toLocaleString()}`}
                            </span>
                            <ArrowRight className="w-4 h-4 text-black shrink-0" />
                          </button>
                        </div>
                      ) : (
                        /* Standard Single Buy Button for GA / Group Passes */
                        <button
                          type="button"
                          onClick={() => handleDirectBuy(tier.id, false)}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <CreditCard className="w-4 h-4 text-black shrink-0" />
                          <span className="truncate">
                            Buy Now • {tier.currency}{" "}
                            {(tier.price * cardQty).toLocaleString()}
                          </span>
                          <ArrowRight className="w-4 h-4 text-black shrink-0" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PHASE ROADMAP POPUP MODAL */}
      {showPhaseModal &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-start sm:items-center p-3 sm:p-6 py-12 sm:py-8"
            onClick={() => setShowPhaseModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="phase-modal-heading"
          >
            <div
              className="bg-[#121524] border border-white/20 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative text-white my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF]">
                    Official Pricing Roadmap
                  </span>
                  <h3
                    id="phase-modal-heading"
                    className="text-lg font-black text-white"
                  >
                    Admission Release Phases
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhaseModal(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-all border border-white/20 shadow-md shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Passes are released in strictly capped allocations. As each
                phase sells out, prices rise automatically to the next tier:
              </p>

              <div className="space-y-2">
                {phaseTiers.map((p) => {
                  const isCurrent = p.id === activePhaseTier?.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        isCurrent
                          ? "bg-[#FF5722]/15 border-[#FF5722] ring-1 ring-[#FF5722]/50 text-white"
                          : "bg-white/5 border-white/10 text-gray-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {p.name}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FF5722] text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                              ACTIVE NOW
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {isCurrent
                            ? "Available for immediate purchase"
                            : "Scheduled upcoming allocation"}
                        </span>
                      </div>
                      <span className="font-mono font-black text-sm text-[#FFD600]">
                        {p.currency} {p.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowPhaseModal(false)}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/15 cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Close Roadmap</span>
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* CHECKOUT & ATTENDEE DATA MODAL */}
      {showCheckoutModal &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-start sm:items-center p-3 sm:p-6 py-12 sm:py-8"
            onClick={() => setShowCheckoutModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-heading"
          >
            <div
              className="bg-[#121524] border border-white/20 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 xs:p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative text-white my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722]">
                    Direct Stripe Checkout
                  </span>
                  <h3
                    id="checkout-modal-heading"
                    className="text-lg sm:text-xl font-black text-white"
                  >
                    Attendee Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-all border border-white/20 shadow-md shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleCheckoutSubmit}
                className="space-y-4 text-left"
              >
                {/* Order Recap */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-gray-300">
                    <span>Selected Passes ({totalItemsCount})</span>
                    <div className="text-right">
                      <span className="font-mono font-black text-[#FFD600] text-sm sm:text-base">
                        {event.currency || "AED"}{" "}
                        {payableAmount.toLocaleString()}
                      </span>
                      {hasDepositSelected && (
                        <span className="block text-[10px] text-amber-300 font-semibold">
                          (Table Reservation Deposit)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 space-y-1 max-h-36 overflow-y-auto">
                    {Object.entries(quantities)
                      .filter(([_, q]) => q > 0)
                      .map(([tId, q]) => {
                        const t = tiers.find((tier) => tier.id === tId);
                        if (!t) return null;
                        const isTierDeposit =
                          isDepositMode[tId] &&
                          (t.category === "table" || t.isVVIP);
                        const depositPct = t.depositPercentage ?? 20;
                        const cost = isTierDeposit
                          ? Math.round(
                              (t.price * q * depositPct) / 100,
                            )
                          : t.price * q;

                        return (
                          <div
                            key={tId}
                            className="flex justify-between text-[11px] text-gray-400"
                          >
                            <span>
                              {q}x {t.name}{" "}
                              {isTierDeposit && (
                                <span className="text-amber-400 font-bold">
                                  ({depositPct}% Deposit)
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-white">
                              {t.currency} {cost.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {remainingBalance > 0 && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex justify-between">
                      <span>Remaining Balance at Entrance:</span>
                      <span className="font-mono font-bold">
                        {event.currency || "AED"}{" "}
                        {remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Full Name & Email */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                      Full Name (Primary Guest){" "}
                      <span className="text-[#FF5722]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Marcus Sterling"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                      Email Address (For Pass &amp; QR Delivery){" "}
                      <span className="text-[#FF5722]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. marcus@example.com"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                      Mobile Phone / WhatsApp{" "}
                      <span className="text-[#FF5722]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                      City / Country of Residence
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dubai, UAE"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                      Special Requests / Dietary / VIP Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Bottle preferences, birthday celebrations, or accessibility needs..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>
                </div>

                {/* Age Policy Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    required
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-1 rounded border-gray-600 text-[#FF5722] focus:ring-0"
                  />
                  <span className="text-[11px] text-gray-300 leading-snug">
                    I confirm that all guests in this order are{" "}
                    <strong>21 years of age or older</strong> and will present
                    an original valid Emirates ID or Passport at the door.
                  </span>
                </label>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Pay with Stripe CTA */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-black" />
                    <span>
                      {isSubmitting
                        ? "Initiating Stripe Payment..."
                        : `Pay ${event.currency || "AED"} ${payableAmount.toLocaleString()} with Stripe`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-gray-200 hover:text-white text-xs font-black uppercase tracking-wider transition-colors text-center border border-white/15 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel &amp; Return to Passes</span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    256-Bit SSL Encrypted. Passes with QR codes emailed
                    immediately after payment.
                  </span>
                </p>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

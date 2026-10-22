"use client";
import VenueLink from "@/components/layout/VenueLink";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  User,
  Users,
  Crown,
  Share2,
  Download,
  LogIn,
  Sparkles,
  Zap,
  ArrowLeft,
  Camera,
  Copy,
  Check,
  ExternalLink,
  Lock,
  ShieldAlert,
  Ban,
  Receipt,
  CreditCard,
} from "lucide-react";
import {
  DbTicket,
  isTicketComplimentary,
  isTicketConfirmedAndValid,
  isTicketVoided,
} from "@/lib/ticket-utils";
import { AuthUser } from "@/lib/auth";

interface TicketPassViewProps {
  ticket: DbTicket;
  qrSvg: string;
  authUser: AuthUser | null;
  ticketUrl: string;
}

export default function TicketPassView({
  ticket: initialTicket,
  qrSvg,
  authUser,
  ticketUrl,
}: TicketPassViewProps) {
  const [ticket, setTicket] = useState<DbTicket>(initialTicket);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Play Web Audio Chime / Buzz
  const playSound = (type: "success" | "error") => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        // Pleasant double major third chime
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Sawtooth alarm buzz
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // AudioContext unavailable
    }
  };

  const handleStaffCheckIn = async () => {
    setIsCheckingIn(true);
    setCheckInError(null);
    setCheckInSuccess(null);

    try {
      const res = await fetch(`/api/tickets/${ticket.ticketCode}/check-in`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setTicket(data.ticket);
        const wristNote = data.ticket?.wristbandColor
          ? ` • Hand attendee ${data.ticket.paxPerUnit || 1}x ${data.ticket.wristbandColor} Wristband(s)`
          : "";
        setCheckInSuccess(
          (data.message || "Attendee admitted successfully!") + wristNote,
        );
        playSound("success");
      } else {
        setCheckInError(data.error || "Failed to check in ticket.");
        if (data.ticket) setTicket(data.ticket);
        playSound("error");
      }
    } catch (err: any) {
      setCheckInError("Network failure while reaching gate server.");
      playSound("error");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const copyTicketUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const isCheckedIn = ticket.status === "CHECKED_IN";
  const isCancelled = ticket.status === "CANCELLED";
  const isComplimentary = isTicketComplimentary(ticket);
  // Void is strictly for paid tickets; complimentary passes cannot be voided
  const isVoided =
    !isComplimentary &&
    (ticket.status === "VOIDED" ||
      isCancelled ||
      ticket.orderStatus === "VOIDED" ||
      ticket.orderStatus === "DISPUTED" ||
      ticket.orderStatus === "REFUNDED" ||
      isTicketVoided(ticket));
  const isConfirmed = isTicketConfirmedAndValid(ticket);
  const isValid = isConfirmed && !isCheckedIn && !isVoided;

  // Table 20% Deposit & Remaining Balance Checks (with 5% tax)
  const isDepositOrder = Boolean(
    ticket.isDeposit ||
      (ticket.remainingBalance && ticket.remainingBalance > 0) ||
      ticket.orderNotes?.toLowerCase().includes("deposit")
  );
  // Deposit paid online (e.g. 1,200 + 60 = 1,260 AED)
  const depositPaid = Number(ticket.orderTotalAmount || ticket.depositAmount || 0);

  // Base remaining balance (e.g. 4,800 AED)
  const baseRemainingBalance = Number(
    ticket.remainingBalance && ticket.remainingBalance > 0
      ? ticket.remainingBalance
      : isDepositOrder && ticket.depositAmount
        ? Number(ticket.depositAmount) * 4
        : isDepositOrder && depositPaid > 0
          ? Math.round((depositPaid / 1.05) * 4)
          : 0
  );

  // 5% tax on the remaining balance (e.g. 5% of 4,800 = 240 AED)
  const balanceTax = Math.round(baseRemainingBalance * 0.05 * 100) / 100;

  // Total balance due at the door = base + 5% tax (e.g. 4,800 + 240 = 5,040 AED)
  const totalBalanceDue = Math.round((baseRemainingBalance + balanceTax) * 100) / 100;

  // Total price incl. 5% tax (e.g. 1,260 + 5,040 = 6,300 AED)
  const fullTotalWithTax = Math.round((depositPaid + totalBalanceDue) * 100) / 100;
  const currency = ticket.orderCurrency || "AED";

  // Gate Check-in permission check (SUPER_ADMIN, GATE_STAFF, ORGANIZER)
  const canPerformCheckIn =
    authUser &&
    (authUser.role === "SUPER_ADMIN" ||
      authUser.role === "GATE_STAFF" ||
      authUser.role === "ORGANIZER");

  return (
    <div className="min-h-screen bg-[#08090E] text-white py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FF5722]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Pass Top Branding & Staff Session Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <Image
                src="/images/logo.png"
                alt="No Limit Fest"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Verified Digital Pass
            </span>
          </div>

          {canPerformCheckIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/scan"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[11px] font-bold text-[#00E5FF] transition-colors"
                title="Switch to continuous camera door scanner"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Camera Scanner</span>
              </Link>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate max-w-[120px]">
                  Staff: {authUser?.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400 border border-white/10 px-2.5 py-0.5 rounded-full bg-white/5">
                {ticket.ticketCode}
              </span>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* MODE A: STAFF GATE OPERATIONS CONSOLE (Only rendered if logged in)   */}
        {/* ==================================================================== */}
        {canPerformCheckIn ? (
          <div
            className={`p-5 rounded-3xl border shadow-2xl transition-all ${
              isCheckedIn
                ? "bg-amber-950/40 border-amber-500/50 shadow-amber-500/15"
                : isCancelled
                  ? "bg-red-950/40 border-red-500/50 shadow-red-500/15"
                  : "bg-emerald-950/40 border-emerald-500/50 shadow-emerald-500/15"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 text-[11px] font-black uppercase tracking-wider text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Gate Staff Operations</span>
              </span>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isCheckedIn
                    ? "bg-amber-500 text-black animate-pulse"
                    : isVoided
                      ? "bg-red-600 text-white font-mono"
                      : isCancelled || !isConfirmed
                        ? "bg-red-500 text-white"
                        : isComplimentary
                          ? "bg-purple-500 text-white"
                          : "bg-emerald-500 text-black"
                }`}
              >
                {isCheckedIn
                  ? "ALREADY CHECKED IN"
                  : isVoided
                    ? "ENTRY BLOCKED • PASS VOIDED"
                    : isCancelled
                      ? "VOID / CANCELLED"
                      : isValid
                        ? isComplimentary
                          ? "COMPLIMENTARY PASS • CONFIRMED"
                          : "VALID FOR ADMISSION"
                        : "PAYMENT PENDING / UNCONFIRMED"}
              </span>
            </div>

            {/* Warning if ticket is unpaid / unconfirmed */}
            {!isConfirmed && !isCheckedIn && !isCancelled && !isVoided && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>PASS NOT CONFIRMED • DO NOT ADMIT</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  This pass is neither paid nor verified as complimentary.
                </p>
                <p className="text-[10px] text-red-300/90 pt-1 font-semibold">
                  ⛔ Entry Denied. Only paid and complementary tickets are
                  confirmed for gate admission.
                </p>
              </div>
            )}

            {/* Check-In Action Button or Status Info */}
            {isValid && (
              <div className="space-y-3">
                {/* HIGH VISIBILITY TABLE 20% DEPOSIT & DOOR BALANCE DUE BANNER */}
                {isDepositOrder && totalBalanceDue > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-100 shadow-xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wider">
                        <Receipt className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                        <span>Table 20% Deposit • Door Collection Required</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider font-mono">
                        BALANCE DUE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                          Total
                        </span>
                        <span className="text-sm sm:text-base font-black text-white font-mono block">
                          {currency} {fullTotalWithTax.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                          Paid online
                        </span>
                        <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block">
                          {currency} {depositPaid.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-950/90 border-2 border-amber-400 shadow-lg shadow-amber-500/20">
                        <span className="text-[10px] uppercase font-bold text-amber-300 block truncate">
                          To be paid at entrance
                        </span>
                        <span className="text-sm sm:text-base font-black text-white font-mono block">
                          {currency} {totalBalanceDue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-200/95 font-bold leading-relaxed bg-black/40 p-2 rounded-xl border border-amber-500/30 text-center">
                      ⚠️ Gate Staff: Collect <strong>{currency} {totalBalanceDue.toLocaleString()}</strong> remaining balance before wristband issuance.
                    </p>
                  </div>
                )}

                <div
                  className="p-4 rounded-2xl border-2 shadow-lg space-y-1.5 transition-all text-center"
                  style={{
                    backgroundColor: `${ticket.tierColor || "#00E676"}18`,
                    borderColor: ticket.tierColor || "#00E676",
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 block">
                    Gate Staff • Wristband to Assign
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0 animate-pulse"
                      style={{ backgroundColor: ticket.tierColor || "#00E676" }}
                    />
                    <span
                      className="text-lg font-black uppercase font-mono tracking-tight"
                      style={{ color: ticket.tierColor || "#00E676" }}
                    >
                      {ticket.wristbandColor || "NEON GREEN"}
                    </span>
                  </div>
                  <p className="text-xs font-black text-white">
                    Issue {ticket.paxPerUnit || 1}x Wristband
                    {(ticket.paxPerUnit || 1) > 1 ? "s" : ""} to{" "}
                    <strong>{ticket.attendeeName}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStaffCheckIn}
                  disabled={isCheckingIn}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    {isCheckingIn
                      ? "Validating Entry..."
                      : isComplimentary
                        ? "⚡ CHECK IN COMPLIMENTARY GUEST"
                        : "⚡ CHECK IN & ADMIT ATTENDEE"}
                  </span>
                </button>
              </div>
            )}

            {isCheckedIn && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>ALREADY ADMITTED AT GATE</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Admitted on:{" "}
                  <strong>
                    {new Date(
                      ticket.checkedInAt || Date.now(),
                    ).toLocaleString()}
                  </strong>
                </p>
                <p className="text-[11px] text-gray-300">
                  Staff Operator:{" "}
                  <strong>{ticket.checkedInBy || "Gate Staff"}</strong>
                </p>
                <p className="text-[10px] text-amber-300/80 pt-1">
                  ⚠️ Duplicate admission blocked. Do not issue duplicate
                  wristbands.
                </p>
              </div>
            )}

            {isVoided && !isCheckedIn ? (
              <div className="p-4 rounded-2xl bg-red-500/20 border-2 border-red-500 text-xs text-red-200 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-black uppercase tracking-wider">ENTRY BLOCKED: PASS VOIDED</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  This ticket has been revoked and marked invalid for gate admission. <strong>DO NOT ISSUE WRISTBAND</strong>.
                </p>
                {(ticket.voidReason || ticket.orderVoidReason || ticket.disputeReason) && (
                  <div className="p-2.5 rounded-lg bg-black/60 border border-red-500/40 text-red-300 font-mono text-[11px]">
                    <strong>Reason:</strong> {ticket.voidReason || ticket.orderVoidReason || ticket.disputeReason}
                  </div>
                )}
              </div>
            ) : isCancelled ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>PASS CANCELLED / REFUNDED</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  This ticket is marked as CANCELLED. Do not admit holder at the
                  gate.
                </p>
              </div>
            ) : null}

            {checkInSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{checkInSuccess}</span>
              </div>
            )}

            {checkInError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{checkInError}</span>
              </div>
            )}
          </div>
        ) : isVoided ? (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Ticket Pass Revoked & Inactive</span>
            </div>
            <p className="text-[11px] text-gray-300 max-w-sm mx-auto leading-relaxed">
              This pass has been voided due to payment dispute, refund, or administrative cancellation and is no longer valid for admission.
            </p>
          </div>
        ) : !isConfirmed && !isCheckedIn ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Pass Inactive • Not Confirmed</span>
            </div>
            <p className="text-[11px] text-gray-300 max-w-sm mx-auto leading-relaxed">
              This pass is not confirmed. Only paid and complementary tickets
              receive active entry passes and admission at the gate.
            </p>
          </div>
        ) : (
          /* ==================================================================== */
          /* MODE B: ATTENDEE / PUBLIC INFORMATIVE VALIDATION BANNER              */
          /* ==================================================================== */
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isComplimentary
                  ? "Complimentary VIP Pass Verification"
                  : "Official Digital Pass Verification"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
              {isComplimentary
                ? "This is the official complimentary VIP guest pass for No Limit Fest. Present the scannable QR code below at the festival entrance for door check-in and wristband issuance."
                : "This is the official digital ticket for No Limit Fest. Present the scannable QR code below at the festival entrance for door check-in and wristband issuance."}
            </p>
          </div>
        )}

        {/* ==================================================================== */}
        {/* OFFICIAL DIGITAL FESTIVAL PASS CARD                                  */}
        {/* ==================================================================== */}
        <div className="rounded-3xl border border-white/15 bg-[#121524] shadow-2xl overflow-hidden relative">
          {/* Animated Anti-Screenshot Security Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] animate-pulse" />

          {/* Pass Header Banner */}
          <div className="p-6 bg-gradient-to-b from-[#181D33] to-[#121524] border-b border-white/10 text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-[#00E5FF] mb-2">
              <Sparkles className="w-3 h-3" />
              <span>
                {isComplimentary
                  ? "Complimentary Pass • VIP Guest"
                  : "Official Festival Pass"}
              </span>
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              {ticket.eventName || "No Limit Fest Dubai"}
            </h1>
            <p className="text-xs font-bold text-[#FFD600] uppercase tracking-wider mt-0.5">
              Live Concert • Edition 01
            </p>

            {/* Status Pill */}
            <div className="mt-3 inline-block">
              {isCheckedIn ? (
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Checked In / Admitted</span>
                </span>
              ) : isVoided ? (
                <span className="px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Ban className="w-3.5 h-3.5" />
                  <span>Pass Voided • Entry Denied</span>
                </span>
              ) : isValid ? (
                isComplimentary ? (
                  <span className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Complimentary Pass • Confirmed</span>
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/50 text-[#FF6E40] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Valid Entry Pass</span>
                  </span>
                )
              ) : (
                <span className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Payment Pending • Unconfirmed</span>
                </span>
              )}
            </div>

            {/* UP-FRONT TABLE DEPOSIT & BALANCE COLLECTION ALERT (FOR GATEKEEPERS & ATTENDEES) */}
            {isDepositOrder && totalBalanceDue > 0 && !isVoided && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/20 border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-left space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                    <Receipt className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Table 20% Deposit Pass</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider font-mono">
                    BALANCE DUE AT DOOR
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                      Total
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white font-mono block">
                      {currency} {fullTotalWithTax.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                      Paid online
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono block">
                      {currency} {depositPaid.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/90 border-2 border-amber-400 shadow-md">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block truncate">
                      To be paid at entrance
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white font-mono block">
                      {currency} {totalBalanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-400/10 border border-amber-400/30 p-2 rounded-xl text-center">
                  <p className="text-[10px] text-amber-200 font-bold leading-tight">
                    ⚠️ Gatekeepers: Verify payment of <strong>{currency} {totalBalanceDue.toLocaleString()}</strong> remaining balance before admission.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CAMERA-SCANNABLE QR CODE AREA (Direct Absolute URL) */}
          <div className="p-6 text-center bg-[#0C0E18] flex flex-col items-center justify-center relative">
            {isValid || isCheckedIn ? (
              <>
                {/* Standard ISO/IEC 18004 Compliant QR Code SVG */}
                <div
                  className="p-3 bg-white rounded-2xl shadow-2xl inline-block"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                {/* Ticket Code & Direct URL */}
                <div className="mt-4 space-y-1.5 w-full">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
                    Ticket Reference Code
                  </span>
                  <p className="text-lg font-mono font-black text-[#00E5FF] tracking-widest">
                    {ticket.ticketCode}
                  </p>

                  {/* Direct Scannable URL info */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={copyTicketUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy Direct URL"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">URL Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[240px]">
                            {ticketUrl}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 mt-3 max-w-xs leading-relaxed">
                  📷 <strong>Scan with any phone camera</strong> to directly open
                  this ticket pass URL and validate admission.
                </p>
              </>
            ) : isVoided ? (
              <div className="py-8 px-4 flex flex-col items-center justify-center space-y-3 max-w-xs text-center">
                <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 text-red-400 flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Ban className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-400">
                    Pass Revoked & Voided
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    This digital pass has been deactivated. Admission at the gate is blocked.
                  </p>
                  {(ticket.voidReason || ticket.orderVoidReason || ticket.disputeReason) && (
                    <div className="mt-2 p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-[11px] font-mono leading-relaxed">
                      <strong>Reason:</strong> {ticket.voidReason || ticket.orderVoidReason || ticket.disputeReason}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 px-4 flex flex-col items-center justify-center space-y-3 max-w-xs text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Pass Locked • Not Confirmed
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This pass has not been paid or confirmed as complimentary.
                    Only paid and complementary tickets receive active entrance
                    QR codes.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/#tickets"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all inline-block"
                  >
                    Purchase Valid Pass
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* HIGH VISIBILITY WRISTBAND COLOR ALLOCATION (Only shown if NOT voided) */}
          {!isVoided && (
            <div
              className="mx-6 my-2 p-4 rounded-2xl border-2 shadow-xl flex items-center justify-between gap-3"
              style={{
                backgroundColor: `${ticket.tierColor || "#00E676"}15`,
                borderColor: ticket.tierColor || "#00E676",
                boxShadow: `0 0 25px ${ticket.tierColor || "#00E676"}25`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md shrink-0 animate-pulse"
                  style={{ backgroundColor: ticket.tierColor || "#00E676" }}
                />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-300 block">
                    Wristband Color
                  </span>
                  <span
                    className="text-base font-black uppercase font-mono tracking-tight block"
                    style={{ color: ticket.tierColor || "#00E676" }}
                  >
                    {ticket.wristbandColor || "NEON GREEN"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Allocation
                </span>
                <span className="text-xs font-black text-white font-mono bg-black/60 px-2.5 py-1 rounded-full border border-white/20 inline-block">
                  {ticket.paxPerUnit || 1} Wristband
                  {(ticket.paxPerUnit || 1) > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* ATTENDEE & TIER DETAILS */}
          <div className="p-6 space-y-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                  Attendee Name
                </span>
                <span className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span className="truncate">{ticket.attendeeName}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                  Pass Tier
                </span>
                <span className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  {ticket.category === "table" ? (
                    <Crown className="w-3.5 h-3.5 text-[#FFD600]" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
                  )}
                  <span className="truncate">{ticket.tierName}</span>
                </span>
              </div>
            </div>

            {/* Table Deposit Payment Details */}
            {isDepositOrder && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-amber-500/20 pb-1.5">
                  <span>Table Payment Summary</span>
                  <span className="text-amber-300">20% Deposit Plan</span>
                </div>
                <div className="space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total</span>
                    <span className="font-bold text-white">{currency} {fullTotalWithTax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400">Paid online</span>
                    <span className="font-bold text-emerald-400">{currency} {depositPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                    <span className="text-amber-300 font-bold">To be paid at entrance</span>
                    <span className="font-black text-white text-sm">{currency} {totalBalanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Event Logistics */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-[#FF5722] shrink-0" />
                <span className="font-bold text-white">
                  {ticket.eventDates || "Saturday 24th October 2026"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-[#FFD600] shrink-0" />
                <span className="font-bold text-white">
                  {ticket.eventTime || "6:00 PM Till Late"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0" />
                <span className="font-bold text-white truncate">
                  <VenueLink
                    venue={ticket.eventVenue || "Helipad by Frozen Cherry, Dubai"}
                  >
                    {ticket.eventVenue || "Helipad by Frozen Cherry, Dubai"}
                  </VenueLink>
                </span>
              </div>
            </div>

            {/* Door Notice */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-400 text-center leading-relaxed">
              🔞 <strong>Strictly 21+ Event</strong>. Original Passport or
              Emirates ID required at entrance. Dynamic live pass verification
              active.
            </div>
          </div>
        </div>

        {/* Public Attendee Sharing & Actions */}
        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print Pass</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${ticket.eventName} - Digital Pass`,
                  text: `My pass for No Limit Fest Dubai: ${ticket.ticketCode}`,
                  url: ticketUrl,
                });
              } else {
                copyTicketUrl();
              }
            }}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Pass URL</span>
          </button>
        </div>
      </div>
    </div>
  );
}

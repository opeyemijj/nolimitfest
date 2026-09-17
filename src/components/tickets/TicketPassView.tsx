"use client";

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
} from "lucide-react";
import { DbTicket } from "@/lib/data-service";
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
  const isValid = ticket.status === "VALID";

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
                    : isCancelled
                      ? "bg-red-500 text-white"
                      : "bg-emerald-500 text-black"
                }`}
              >
                {isCheckedIn
                  ? "ALREADY CHECKED IN"
                  : isCancelled
                    ? "VOID / CANCELLED"
                    : "VALID FOR ADMISSION"}
              </span>
            </div>

            {/* Check-In Action Button or Status Info */}
            {isValid && (
              <div className="space-y-3">
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

            {isCancelled && (
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
            )}

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
        ) : (
          /* ==================================================================== */
          /* MODE B: ATTENDEE / PUBLIC INFORMATIVE VALIDATION BANNER              */
          /* ==================================================================== */
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Digital Pass Verification</span>
            </div>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
              This is the official digital ticket for No Limit Fest. Present the
              scannable QR code below at the festival entrance for door check-in
              and wristband issuance.
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
              <span>Official Festival Pass</span>
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
              ) : isCancelled ? (
                <span className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Void / Cancelled</span>
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/50 text-[#FF6E40] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Valid Entry Pass</span>
                </span>
              )}
            </div>
          </div>

          {/* CAMERA-SCANNABLE QR CODE AREA (Direct Absolute URL) */}
          <div className="p-6 text-center bg-[#0C0E18] flex flex-col items-center justify-center relative">
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
          </div>

          {/* HIGH VISIBILITY WRISTBAND COLOR ALLOCATION */}
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
                  {ticket.eventVenue || "Helipad by Frozen Cherry, Dubai"}
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

        {/* Informative Staff Link for Gate Ushers */}
        {!canPerformCheckIn && (
          <div className="text-center pt-2">
            <Link
              href={`/admin/login?redirect=/tickets/${ticket.ticketCode}`}
              className="text-[11px] text-gray-500 hover:text-gray-300 underline transition-colors"
            >
              Are you entrance gate staff? Sign in to check in this attendee
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

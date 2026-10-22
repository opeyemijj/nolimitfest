"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Zap,
  User,
  Crown,
  Users,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Ban,
  Receipt,
} from "lucide-react";
import { DbTicket } from "@/lib/data-service";

export default function GateScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<{
    status: "SUCCESS" | "DUPLICATE" | "INVALID" | "VOIDED";
    message: string;
    ticket?: DbTicket;
  } | null>(null);
  const [gateCount, setGateCount] = useState(0);

  // Play Web Audio Chime or Buzz
  const playSound = (type: "success" | "error") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
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

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Camera API not supported on this device. Please use manual code lookup below.",
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera access denied or unavailable. Use manual check-in search below.",
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Continuous Native Barcode Detection loop if supported
  useEffect(() => {
    let interval: any;
    if (
      cameraActive &&
      typeof window !== "undefined" &&
      "BarcodeDetector" in window
    ) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ["qr_code"],
      });

      interval = setInterval(async () => {
        if (videoRef.current && !isProcessing) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue;
              handleDetectedCode(rawVal);
            }
          } catch (e) {
            // Ignore frame detection glitch
          }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameraActive, isProcessing]);

  // Handle scanned or entered code
  const handleDetectedCode = async (rawString: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Clean code: extract NLF-... from URL if URL was scanned
    let code = rawString.trim();
    if (code.includes("/tickets/")) {
      const parts = code.split("/tickets/");
      code = parts[1].split("?")[0].split("/")[0];
    }

    try {
      const res = await fetch(`/api/tickets/${code}/check-in`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setScanResult({
          status: "SUCCESS",
          message: data.message || "Attendee Admitted Successfully!",
          ticket: data.ticket,
        });
        setGateCount((prev) => prev + 1);
        playSound("success");
      } else if (data.status === "VOIDED") {
        setScanResult({
          status: "VOIDED",
          message: data.error || "ENTRY BLOCKED: Pass has been VOIDED.",
          ticket: data.ticket,
        });
        playSound("error");
      } else if (res.status === 409) {
        setScanResult({
          status: "DUPLICATE",
          message: data.error || "TICKET ALREADY CHECKED IN!",
          ticket: data.ticket,
        });
        playSound("error");
      } else {
        setScanResult({
          status: "INVALID",
          message: data.error || "Invalid or Unrecognized Ticket QR.",
        });
        playSound("error");
      }
    } catch {
      setScanResult({
        status: "INVALID",
        message: "Failed to connect to gate check-in server.",
      });
      playSound("error");
    } finally {
      // Allow next scan after 2 seconds
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedCode(manualCode);
    setManualCode("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Helipad Gate Operations
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Gate QR Scanner
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            Gate Total: {gateCount} Admitted
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            title={soundEnabled ? "Mute audio" : "Enable sound"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#FFD600]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* SCANNER CAMERA BOX */}
      <div className="relative rounded-3xl overflow-hidden bg-black border border-white/15 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center shadow-2xl">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
        />

        {/* Viewfinder Target Graphic Overlay */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened Vignette */}
            <div className="absolute inset-0 border-[40px] sm:border-[60px] border-black/60 backdrop-blur-[2px]" />

            {/* Target Reticle */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-[#00E5FF]/70 rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.4)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FF5722] rounded-tl-md" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#FF5722] rounded-tr-md" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#FF5722] rounded-bl-md" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FF5722] rounded-br-md" />

              {/* Animated Laser Scanning Beam */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF5722] to-transparent shadow-[0_0_15px_#FF5722] animate-bounce" />
            </div>

            <div className="absolute bottom-6 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
              {isProcessing ? "Verifying Pass..." : "Align QR Code Inside Box"}
            </div>
          </div>
        )}

        {/* Camera Inactive Placeholder */}
        {!cameraActive && (
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Camera Offline</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Activate device camera to start continuous hands-free ticket
                scanning at Helipad gates.
              </p>
            </div>

            {cameraError && (
              <p className="text-xs text-red-400 max-w-xs mx-auto">
                {cameraError}
              </p>
            )}

            <button
              type="button"
              onClick={startCamera}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:scale-105 transition-all"
            >
              Start Camera Scanner
            </button>
          </div>
        )}
      </div>

      {/* CAMERA TOGGLE BAR */}
      {cameraActive && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={stopCamera}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 transition-colors"
          >
            Turn Off Camera
          </button>
        </div>
      )}

      {/* SCAN RESULT FEEDBACK DISPLAY */}
      {scanResult && (
        <div
          className={`p-6 rounded-3xl border shadow-2xl transition-all space-y-3 ${
            scanResult.status === "SUCCESS"
              ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200"
              : scanResult.status === "DUPLICATE"
                ? "bg-amber-950/60 border-amber-500/60 text-amber-200"
                : scanResult.status === "VOIDED"
                  ? "bg-red-950/90 border-red-500 shadow-red-500/40 text-red-200 ring-2 ring-red-500/50"
                  : "bg-red-950/60 border-red-500/60 text-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-base uppercase tracking-wide">
              {scanResult.status === "SUCCESS" && (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              )}
              {scanResult.status === "DUPLICATE" && (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
              {scanResult.status === "VOIDED" && (
                <Ban className="w-6 h-6 text-red-400 animate-pulse" />
              )}
              {scanResult.status === "INVALID" && (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <span>{scanResult.message}</span>
            </div>

            <span className="text-xs font-mono font-bold opacity-75">
              {new Date().toLocaleTimeString()}
            </span>
          </div>

          {scanResult.ticket && (
            <div className="space-y-3">
              {scanResult.status === "VOIDED" ? (
                /* CRITICAL REFUSAL BANNER FOR VOIDED TICKETS */
                <div className="p-5 rounded-2xl border-2 border-red-500 bg-red-950/90 text-center shadow-[0_0_35px_rgba(239,68,68,0.5)] space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-lg">
                    <Ban className="w-4 h-4" />
                    <span>ENTRY REFUSED • PASS REVOKED</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                    DO NOT ISSUE WRISTBAND
                  </h4>
                  <p className="text-xs text-red-200 leading-relaxed font-semibold max-w-md mx-auto">
                    This pass was voided due to cardholder payment dispute, chargeback, or administrative revocation. Confiscate any wristband and escort attendee to Festival Box Office / Security.
                  </p>
                </div>
              ) : (
                <>
                  {/* TABLE 20% DEPOSIT & DOOR BALANCE DUE ALERT FOR GATEKEEPERS */}
                  {(() => {
                    const t = scanResult.ticket;
                    const isDeposit = Boolean(
                      t.isDeposit ||
                        (t.remainingBalance && t.remainingBalance > 0) ||
                        t.orderNotes?.toLowerCase().includes("deposit")
                    );
                    const paid = Number(t.orderTotalAmount || t.depositAmount || 0);
                    const baseBalance = Number(
                      t.remainingBalance && t.remainingBalance > 0
                        ? t.remainingBalance
                        : isDeposit && t.depositAmount
                          ? Number(t.depositAmount) * 4
                          : isDeposit && paid > 0
                            ? Math.round((paid / 1.05) * 4)
                            : 0
                    );
                    const balanceTax = Math.round(baseBalance * 0.05 * 100) / 100;
                    const totalDue = Math.round((baseBalance + balanceTax) * 100) / 100;
                    const curr = t.orderCurrency || "AED";

                    if (!isDeposit || totalDue <= 0) return null;

                    return (
                      <div className="p-5 rounded-2xl border-2 border-amber-400 bg-amber-950/90 text-center shadow-[0_0_35px_rgba(245,158,11,0.35)] space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-lg">
                          <Receipt className="w-4 h-4 text-black shrink-0" />
                          <span>COLLECT TABLE BALANCE BEFORE ADMISSION</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                          <div className="p-3 rounded-xl bg-black/70 border border-white/10">
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Paid Online (20% + Tax)
                            </span>
                            <span className="text-sm font-black text-emerald-400 font-mono block">
                              {curr} {paid.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-500/20 border-2 border-amber-400 shadow-lg">
                            <span className="text-[10px] text-amber-300 uppercase font-bold block">
                              Collect at Door (80% + Tax)
                            </span>
                            <span className="text-lg font-black text-white font-mono block">
                              {curr} {totalDue.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="max-w-sm mx-auto p-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-center justify-between">
                          <span>Base: <strong>{curr} {baseBalance.toLocaleString()}</strong></span>
                          <span>5% Tax: <strong>{curr} {balanceTax.toLocaleString()}</strong></span>
                          <span className="text-white font-bold">Total: <strong>{curr} {totalDue.toLocaleString()}</strong></span>
                        </div>

                        <p className="text-xs text-amber-200 font-black max-w-md mx-auto leading-relaxed bg-black/40 py-2 px-3 rounded-xl border border-amber-500/30">
                          ⚠️ Verify payment of <strong>{curr} {totalDue.toLocaleString()}</strong> ({curr} {baseBalance.toLocaleString()} + 5% tax) before issuing {t.paxPerUnit || 1} wristband(s).
                        </p>
                      </div>
                    );
                  })()}

                  {/* ULTRA PROMINENT WRISTBAND ALLOCATION BANNER */}
                <div
                  className="p-5 rounded-2xl border-2 text-center shadow-2xl space-y-2 transition-all"
                  style={{
                    backgroundColor: `${scanResult.ticket.tierColor || "#00E676"}18`,
                    borderColor: scanResult.ticket.tierColor || "#00E676",
                    boxShadow: `0 0 35px ${scanResult.ticket.tierColor || "#00E676"}40`,
                  }}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-300 block">
                    Wristband Color to Assign
                  </span>

                  <div className="flex items-center justify-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white shadow-lg animate-pulse shrink-0"
                      style={{
                        backgroundColor: scanResult.ticket.tierColor || "#00E676",
                      }}
                    />
                    <h4
                      className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-mono drop-shadow-md"
                      style={{
                        color: scanResult.ticket.tierColor || "#00E676",
                      }}
                    >
                      {scanResult.ticket.wristbandColor || "NEON GREEN"}
                    </h4>
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-white/20 text-white text-xs sm:text-sm font-black uppercase tracking-wider">
                      👉 ISSUE {scanResult.ticket.paxPerUnit || 1} WRISTBAND
                      {(scanResult.ticket.paxPerUnit || 1) > 1 ? "S" : ""}
                    </span>
                  </div>
                </div>
              </>
              )}

              {/* Attendee Details Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">
                    Attendee
                  </span>
                  <span className="font-bold text-white text-sm block mt-0.5">
                    {scanResult.ticket.attendeeName}
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {scanResult.ticket.ticketCode}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">
                    Pass Category
                  </span>
                  <span className="font-bold text-[#FFD600] text-sm block mt-0.5">
                    {scanResult.ticket.tierName}
                  </span>
                  <div className="mt-2">
                    <Link
                      href={`/tickets/${scanResult.ticket.ticketCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#00E5FF] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Pass (New Tab)</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL LOOKUP FALLBACK */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10 space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase text-white">
            Manual Door Lookup &amp; Scanner Wedge
          </h3>
          <p className="text-xs text-gray-400">
            For attendees with cracked screens or hardware USB/Bluetooth barcode
            guns.
          </p>
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter Ticket Reference Code (e.g. NLF-DUBAI-94821)..."
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !manualCode.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <span>Check In</span>
          </button>
        </form>
      </div>
    </div>
  );
}

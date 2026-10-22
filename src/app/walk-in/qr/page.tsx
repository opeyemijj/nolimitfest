import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  Flame,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { generateQrSvg } from "@/lib/qrcode";

export const dynamic = "force-dynamic";

export default async function WalkInGateQrPage() {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  const walkInFormUrl = `${origin}/walk-in`;
  const qrSvg = await generateQrSvg(walkInFormUrl, 380);

  return (
    <div className="min-h-screen bg-[#08090E] text-white pt-20 pb-16 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FF5722]/20 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-md mx-auto text-center space-y-6 relative z-10 w-full">
        {/* Entrance Gate Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF5722]/25 to-[#FFD600]/25 border border-[#FF5722]/50 text-[#FFD600] text-xs font-black uppercase tracking-widest shadow-lg">
            <Flame className="w-4 h-4 text-[#FF5722] animate-bounce" />
            <span>Entrance Gate Fast-Track Sign</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono leading-tight">
            NO TICKET? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">
              SCAN HERE TO REGISTER
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
            Point your smartphone camera at the QR code below to fill your details in 30 seconds and generate your counter payment invoice.
          </p>
        </div>

        {/* Large Scannable QR Code Poster Card */}
        <div className="p-7 rounded-3xl bg-[#121420] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-4">
          <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl">
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00E5FF] block font-mono">
              30-Second Mobile Sign-Up
            </span>
            <p className="text-[11px] text-gray-400 font-mono break-all">
              {walkInFormUrl}
            </p>
          </div>

          {/* 3 Step Visual Instructions */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-left">
            <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#FF5722] text-black font-black text-[10px] flex items-center justify-center font-mono">
                1
              </span>
              <p className="text-[10px] text-gray-300 font-bold leading-tight">
                Scan QR with camera
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#FFD600] text-black font-black text-[10px] flex items-center justify-center font-mono">
                2
              </span>
              <p className="text-[10px] text-gray-300 font-bold leading-tight">
                Select pass &amp; submit
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#00E5FF] text-black font-black text-[10px] flex items-center justify-center font-mono">
                3
              </span>
              <p className="text-[10px] text-gray-300 font-bold leading-tight">
                Pay cashier &amp; enter
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/walk-in"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 font-mono"
          >
            <span>Open Registration Form</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

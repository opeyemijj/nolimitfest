"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Ticket,
  Users,
  MessageCircle,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render on backoffice admin routes or standalone ticket verification pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/tickets/")) {
    return null;
  }

  const cleanPhone = siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pointer-events-none">
      {/* Scroll to Top floating pill */}
      {showBackToTop && (
        <div className="flex justify-end px-4 mb-2">
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="pointer-events-auto p-2.5 rounded-full bg-[#151824]/90 backdrop-blur-xl border border-white/15 text-gray-300 hover:text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronUp className="w-4 h-4 text-[#00E5FF]" />
          </button>
        </div>
      )}

      {/* Main Glassmorphic Sticky Action Bar */}
      <div className="pointer-events-auto bg-[#090B12]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1.5">
          {/* 1. Buy Tickets Primary CTA */}
          <a
            href="/#tickets"
            className="col-span-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/30 active:scale-95 transition-all text-center leading-tight font-mono"
          >
            <Flame className="w-4 h-4 text-black shrink-0 animate-bounce" />
            <span className="truncate">Buy Tickets</span>
          </a>

          {/* 2. Lineup Quick Link */}
          <Link
            href="/lineup"
            className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 border text-center transition-all ${
              pathname === "/lineup"
                ? "bg-white/15 border-[#00E5FF]/40 text-[#00E5FF]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-[10px] font-bold uppercase tracking-tight truncate">
              Lineup
            </span>
          </Link>

          {/* 3. WhatsApp Concierge */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              "Hello No Limit Fest Concierge! I would like to inquire about ticket passes and VIP tables for Dubai 2026.",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-1 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 flex flex-col items-center justify-center gap-0.5 transition-all text-center"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-tight truncate">
              WhatsApp
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

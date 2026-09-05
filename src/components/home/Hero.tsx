"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Flame, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Clock,
  Ticket,
  Crown,
  CheckCircle2
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { getActiveEvent } from "@/data/events";

export default function Hero() {
  const currentEvent = getActiveEvent();

  // Festival Countdown to Saturday 24th October 2026, 6:00 PM
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-10-24T18:00:00+04:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Concert Visual with Dark Overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80"
          alt="No Limit Fest Dubai Stage Background"
          fill
          priority
          className="object-cover object-center opacity-25 scale-105 transition-transform duration-1000"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090E]/80 via-[#08090E]/60 to-[#08090E]" />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#FF5722]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#00E5FF]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFD600]/10 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md mb-6 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
          <span className="text-xs font-black tracking-widest text-[#00E5FF] uppercase">
            Official 1st Edition • Dubai
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-xs font-semibold text-[#FFD600]">
            Saturday 24th Oct 2026 • 6PM Till Late
          </span>
        </div>

        {/* Official Logo Hero Display - Large & Standalone */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] mb-4 animate-float">
          <Image
            src="/images/logo.png"
            alt="No Limit Fest"
            fill
            priority
            className="object-contain drop-shadow-[0_0_50px_rgba(255,87,34,0.7)]"
          />
        </div>

        {/* Headline Starring Ruger & Fido */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[0.95]">
            RUGER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">&amp; FIDO</span>
          </h1>
          <p className="text-xl sm:text-2xl font-black uppercase text-[#FFD600] tracking-widest">
            HEADLINER: RUGER • UNDERCARD: FIDO
          </p>
        </div>

        <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl font-medium leading-relaxed">
          The global debut of No Limit Fest takes over the breathtaking <strong className="text-white">Helipad by Frozen Cherry</strong>. An unforgettable sunset-to-night spectacle with Afrobeats, Amapiano, and Dubai’s finest party crowd.
        </p>

        {/* Venue, Date, Time & Partners Details */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-[#FF5722]" />
            <span className="font-bold text-white">Saturday 24th October 2026</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-[#FFD600]" />
            <span className="font-bold text-white">6:00 PM Till Late</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10">
            <MapPin className="w-4 h-4 text-[#00E5FF]" />
            <span className="font-bold text-white">Helipad by Frozen Cherry, Dubai</span>
          </div>
        </div>

        {/* Official Headliner Flyers Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md w-full">
          <Link href="/lineup" className="group relative rounded-2xl overflow-hidden border border-amber-500/40 hover:border-[#FF5722] transition-all shadow-xl hover:-translate-y-1">
            <div className="relative aspect-[9/16] w-full">
              <Image
                src="/images/artists/ruger.jpg"
                alt="Ruger Live at No Limit Fest Dubai - Official Headliner"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-2.5 bg-[#121422] text-center">
              <span className="text-xs font-black uppercase text-[#FF5722] block">★ RUGER ★</span>
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Official Headliner</span>
            </div>
          </Link>

          <Link href="/lineup" className="group relative rounded-2xl overflow-hidden border border-white/15 hover:border-[#00E5FF] transition-all shadow-xl hover:-translate-y-1">
            <div className="relative aspect-[9/16] w-full">
              <Image
                src="/images/artists/fido.jpg"
                alt="Fido Live at No Limit Fest Dubai - Official Undercard"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-2.5 bg-[#121422] text-center">
              <span className="text-xs font-black uppercase text-[#00E5FF] block">★ FIDO ★</span>
              <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider">Official Undercard</span>
            </div>
          </Link>
        </div>

        {/* Countdown Timer */}
        <div className="mt-8 p-4 sm:p-6 rounded-3xl bg-black/50 border border-white/15 backdrop-blur-xl max-w-xl w-full shadow-2xl">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#FFD600] mb-3 text-center">
            Gates Open at Helipad in
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl sm:text-4xl font-black text-white font-mono">{timeLeft.days}</span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Days</span>
            </div>
            <div className="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl sm:text-4xl font-black text-[#FF5722] font-mono">{timeLeft.hours}</span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Hours</span>
            </div>
            <div className="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl sm:text-4xl font-black text-[#FFD600] font-mono">{timeLeft.minutes}</span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Mins</span>
            </div>
            <div className="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl sm:text-4xl font-black text-[#00E5FF] font-mono">{timeLeft.seconds}</span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Secs</span>
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <a
            href="#events"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Flame className="w-5 h-5 text-white animate-bounce" />
            <span>Register EOI / Book Table</span>
          </a>

          <Link
            href="/vip"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:border-white/40"
          >
            <Crown className="w-4 h-4 text-[#FFD600]" />
            <span>VIP Tables (6, 8, 10)</span>
          </Link>
        </div>

        {/* Organizers Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-400">
          <span className="text-[11px] uppercase tracking-widest font-black text-gray-400">
            Organized By:
          </span>
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="relative h-8 w-24 sm:w-28 flex items-center justify-center">
              <Image
                src="/images/organizers/shurlaybor.png"
                alt="Shurlaybor Empire - Official Festival Organizer"
                fill
                className="object-contain filter drop-shadow-[0_0_10px_rgba(255,214,0,0.3)]"
              />
            </div>
            <span className="text-gray-600 text-sm">•</span>
            <div className="relative h-7 w-28 sm:w-32 flex items-center justify-center">
              <Image
                src="/images/organizers/typical-naija.png"
                alt="Typical Naija - Official Festival Organizer"
                fill
                className="object-contain filter drop-shadow-[0_0_10px_rgba(0,230,118,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="w-full mt-12 overflow-hidden border-y border-white/10 bg-[#0C0E17]/80 py-3.5 backdrop-blur-md">
        <div className="flex animate-marquee whitespace-nowrap text-xs sm:text-sm font-black uppercase tracking-widest text-gray-300">
          <span className="mx-4 text-[#FF5722]">★ HEADLINER: RUGER LIVE</span>
          <span className="mx-4 text-[#00E5FF]">★ UNDERCARD: FIDO LIVE</span>
          <span className="mx-4 text-[#FFD600]">★ SATURDAY 24TH OCTOBER 2026</span>
          <span className="mx-4 text-emerald-400">★ 6PM TILL LATE</span>
          <span className="mx-4 text-[#FF007F]">★ HELIPAD BY FROZEN CHERRY</span>
          <span className="mx-4 text-white">★ INDIVIDUAL PASSES &amp; TABLES (6, 8, 10)</span>
          <span className="mx-4 text-[#FF5722]">★ HEADLINER: RUGER LIVE</span>
          <span className="mx-4 text-[#00E5FF]">★ UNDERCARD: FIDO LIVE</span>
          <span className="mx-4 text-[#FFD600]">★ SATURDAY 24TH OCTOBER 2026</span>
          <span className="mx-4 text-emerald-400">★ 6PM TILL LATE</span>
          <span className="mx-4 text-[#FF007F]">★ HELIPAD BY FROZEN CHERRY</span>
        </div>
      </div>
    </div>
  );
}

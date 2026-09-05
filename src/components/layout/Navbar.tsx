"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Sparkles, 
  Flame, 
  Globe, 
  ChevronDown, 
  MessageCircle,
  Database
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { festivalEvents, getActiveEvent } from "@/data/events";
import LeadsDrawer from "@/components/eoi/LeadsDrawer";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityDropdown, setCityDropdown] = useState(false);
  const [showLeads, setShowLeads] = useState(false);
  const [leadCount, setLeadCount] = useState(0);
  const pathname = usePathname();

  const currentEvent = getActiveEvent();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Update lead count from storage
    const checkLeads = () => {
      try {
        const raw = localStorage.getItem("no_limit_fest_leads_v1");
        if (raw) {
          const list = JSON.parse(raw);
          setLeadCount(list.length);
        }
      } catch {
        // ignore
      }
    };
    checkLeads();
    window.addEventListener("storage", checkLeads);
    const interval = setInterval(checkLeads, 3000);
    return () => {
      window.removeEventListener("storage", checkLeads);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: "Dubai Lineup", href: "/lineup" },
    { name: "Experience", href: "/experience" },
    { name: "VIP & Hospitality", href: "/vip" },
    { name: "Global Tour", href: "/events" },
    { name: "Festival Guide", href: "/info" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#08090E]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-1.5"
            : "bg-gradient-to-b from-[#08090E]/90 via-[#08090E]/60 to-transparent py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & City Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group py-1" aria-label="No Limit Fest">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="No Limit Fest"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(255,87,34,0.6)]"
                  priority
                />
              </div>
            </Link>

            {/* City Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setCityDropdown(!cityDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors"
                title="Select Tour City"
              >
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
                <span className="hidden xs:inline">{currentEvent.flag}</span>
                <span className="font-bold text-white uppercase">{currentEvent.city}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${cityDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {cityDropdown && (
                <div 
                  className="absolute left-0 mt-2 w-56 rounded-2xl bg-[#121420] border border-white/15 p-2 shadow-2xl z-50 backdrop-blur-xl"
                  onMouseLeave={() => setCityDropdown(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Festival Edition
                  </div>
                  {festivalEvents.map((evt) => (
                    <Link
                      key={evt.id}
                      href={`/events/${evt.slug}`}
                      onClick={() => setCityDropdown(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        evt.isCurrentEdition
                          ? "bg-[#FF5722]/15 text-[#FF6E40] border border-[#FF5722]/30"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{evt.flag}</span>
                        <div>
                          <p className="font-bold text-white">{evt.city}</p>
                          <p className="text-[10px] text-gray-400">{evt.dates}</p>
                        </div>
                      </div>
                      {evt.isCurrentEdition ? (
                        <span className="text-[9px] bg-[#FF5722] text-white px-1.5 py-0.5 rounded-full font-bold">
                          ACTIVE
                        </span>
                      ) : evt.status === "waitlist" ? (
                        <span className="text-[9px] bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30 px-1.5 py-0.5 rounded-full font-bold">
                          WAITLIST
                        </span>
                      ) : (
                        <span className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full">
                          SOON
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-200 relative py-1 ${
                    active
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF5722] to-[#FFD600] rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Leads Manager & Register Interest */}
          <div className="flex items-center gap-2.5">
            {/* Organizer Leads Trigger */}
            <button
              onClick={() => setShowLeads(true)}
              className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-[#00E5FF] transition-colors"
              title="View Inquiries & Export CSV"
            >
              <Database className="w-4 h-4" />
              {leadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF007F] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {leadCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Quick Chat */}
            <a
              href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                "Hello No Limit Fest Concierge! I have a question about the Dubai edition."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hover:scale-105"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Main EOI Button */}
            <a
              href="#eoi"
              className="relative group overflow-hidden rounded-full p-[1px] font-bold text-xs sm:text-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#FF007F] animate-pulse"></span>
              <span className="relative flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#08090E] transition-all duration-300 group-hover:bg-transparent group-hover:text-white text-white">
                <Flame className="w-4 h-4 text-[#FF5722] group-hover:text-white transition-colors" />
                <span className="uppercase tracking-wider font-extrabold">Register EOI</span>
              </span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white border border-white/10"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden bg-[#0D0F18]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-4 pb-6 mt-3 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <span className="text-gray-500 text-xs">→</span>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <a
                href="#eoi"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20"
              >
                Register Interest (EOI)
              </a>
              <a
                href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Organizer Leads Drawer */}
      <LeadsDrawer isOpen={showLeads} onClose={() => setShowLeads(false)} />
    </>
  );
}

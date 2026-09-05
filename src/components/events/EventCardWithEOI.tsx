"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Flame, 
  Check, 
  MessageCircle, 
  CheckCircle2, 
  Lock, 
  ChevronDown,
  User,
  Crown
} from "lucide-react";
import { FestivalEvent, TicketTier } from "@/data/events";
import { formatWhatsAppMessage, getWhatsAppUrl, saveLeadLocally, PassType } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

interface EventCardWithEOIProps {
  event: FestivalEvent;
  isInitialExpanded?: boolean;
}

export default function EventCardWithEOI({ event, isInitialExpanded = true }: EventCardWithEOIProps) {
  const [selectedPass, setSelectedPass] = useState<PassType>("Table for 8");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState("");
  const [showForm, setShowForm] = useState(isInitialExpanded);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !location) {
      alert("Please fill in all required contact details.");
      return;
    }

    const finalWhatsApp = sameAsPhone ? phone : (whatsapp || phone);

    const customPhone =
      (typeof window !== "undefined" && localStorage.getItem("no_limit_fest_whatsapp_override")) ||
      siteConfig.defaultWhatsApp;

    const leadData = {
      eventName: `${event.name} (${event.city})`,
      name: fullName,
      email,
      phone,
      whatsapp: finalWhatsApp,
      location,
      passType: selectedPass,
      notes: notes.trim() || undefined,
    };

    saveLeadLocally(leadData);

    const message = formatWhatsAppMessage(leadData);
    const targetUrl = getWhatsAppUrl(customPhone, message);
    setLastWhatsAppUrl(targetUrl);
    setSubmitted(true);

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setWhatsapp("");
    setLocation("");
    setNotes("");
  };

  return (
    <div
      id={`event-${event.slug}`}
      className={`rounded-3xl border overflow-hidden bg-[#10121C] transition-all duration-300 shadow-2xl ${
        event.isCurrentEdition
          ? "border-[#FF5722]/50 shadow-orange-500/10 ring-1 ring-[#FF5722]/30"
          : "border-white/10"
      }`}
    >
      {/* Event Header Banner */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <Image
          src={event.heroImage}
          alt={`${event.name} ${event.city}`}
          fill
          priority={event.isCurrentEdition}
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10121C] via-[#10121C]/60 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl drop-shadow-lg">{event.flag}</span>
            <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-black uppercase text-white">
              {event.city}, {event.country}
            </span>
          </div>

          {event.isCurrentEdition ? (
            <span className="px-4 py-1.5 rounded-full bg-[#FF5722] text-white text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
              Flagship • Edition 01
            </span>
          ) : event.status === "waitlist" ? (
            <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFD600] to-[#FF5722] text-black text-xs font-black uppercase tracking-wider shadow-lg">
              GCC Tour • Priority Waitlist
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-gray-300 text-xs font-bold uppercase">
              {event.status.toUpperCase()}
            </span>
          )}
        </div>

        {/* Bottom Banner Title */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">
            {event.edition}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {event.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#FFD600] font-semibold mt-1">
            {event.tagline}
          </p>
        </div>
      </div>

      {/* Event Overview Details */}
      <div className="p-6 sm:p-8 space-y-6">
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-4xl">
          {event.description}
        </p>

        {/* Quick Meta Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#FF5722] shrink-0" />
            <div>
              <p className="text-gray-400 text-[10px]">Dates</p>
              <p className="font-bold text-white">{event.dates}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <div>
              <p className="text-gray-400 text-[10px]">Venue</p>
              <p className="font-bold text-white truncate max-w-[140px]">{event.venue}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#FFD600] shrink-0" />
            <div>
              <p className="text-gray-400 text-[10px]">Stages</p>
              <p className="font-bold text-white">{event.stagesCount} Mega Stages</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-gray-400 text-[10px]">Expected Crowd</p>
              <p className="font-bold text-white">{event.expectedAttendance}</p>
            </div>
          </div>
        </div>

        {/* PASS TIERS: Individual, Table for 6, Table for 8, Table for 10 */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5722]">
                Select Pass Category
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Passes & Table Packages
              </h3>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline font-medium">
              Click any pass below to configure your EOI form
            </span>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {event.ticketTiers.map((tier) => {
              const isSelected = selectedPass === tier.name;
              return (
                <div
                  key={tier.id}
                  onClick={() => {
                    setSelectedPass(tier.name);
                    setShowForm(true);
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-b from-[#1E2336] to-[#141724] border-[#FF5722] ring-2 ring-[#FF5722]/50 shadow-xl shadow-orange-500/15 -translate-y-1"
                      : "bg-[#141724] border-white/10 hover:border-white/25 hover:bg-[#181C2C]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-wider">
                        {tier.capacityLabel}
                      </span>
                      {tier.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF5722] text-white text-[9px] font-black uppercase">
                          Popular
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-black text-white flex items-center gap-1.5">
                      {tier.name === "Individual Pass" ? (
                        <User className="w-4 h-4 text-[#00E5FF]" />
                      ) : (
                        <Crown className="w-4 h-4 text-[#FFD600]" />
                      )}
                      <span>{tier.name}</span>
                    </h4>

                    <p className="text-lg font-black text-[#FFD600] font-mono mt-2">
                      {tier.priceEstimate}
                    </p>

                    <ul className="mt-3 space-y-1.5 text-xs text-gray-300">
                      {tier.perks.slice(0, 3).map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug text-[11px]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span
                      className={`block text-center py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                        isSelected
                          ? "bg-[#FF5722] text-white"
                          : "bg-white/5 text-gray-300 group-hover:text-white"
                      }`}
                    >
                      {isSelected ? "✓ Selected for EOI" : "Choose Tier"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EOI FORM DIRECTLY UNDER THIS EVENT */}
        <div className="pt-6 border-t border-white/10">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141724] border border-white/15 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5722]/15 text-[#FF6E40] text-[10px] font-black uppercase tracking-wider mb-1">
                  <Flame className="w-3 h-3" />
                  <span>Expression of Interest Form</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Register Interest for {event.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Priority access for <strong className="text-[#FFD600]">{selectedPass}</strong> in {event.city}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <span>{showForm ? "Collapse Form" : "Expand Form"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showForm ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showForm && (
              <>
                {submitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-white">
                        Interest Registered for {event.city}!
                      </h4>
                      <p className="text-xs text-gray-300 max-w-md mx-auto">
                        Your submission for <span className="text-[#FF5722] font-bold">{selectedPass}</span> has been dispatched directly to our festival director on WhatsApp.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      {lastWhatsAppUrl && (
                        <a
                          href={lastWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Re-open WhatsApp Chat</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pass Type Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Selected Pass / Table
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["Individual Pass", "Table for 6", "Table for 8", "Table for 10"] as PassType[]).map((pass) => (
                          <button
                            type="button"
                            key={pass}
                            onClick={() => setSelectedPass(pass)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                              selectedPass === pass
                                ? "bg-[#FF5722] text-white border-[#FF5722] shadow-md shadow-orange-500/20"
                                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {pass}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                          Full Name <span className="text-[#FF5722]">*</span>
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
                          Email Address <span className="text-[#FF5722]">*</span>
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
                    </div>

                    {/* Phone & WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                          Phone Number <span className="text-[#FF5722]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                            WhatsApp Number <span className="text-[#FF5722]">*</span>
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sameAsPhone}
                              onChange={(e) => {
                                setSameAsPhone(e.target.checked);
                                if (e.target.checked) setWhatsapp(phone);
                              }}
                              className="rounded border-gray-600 text-[#FF5722] focus:ring-0"
                            />
                            <span>Same as phone</span>
                          </label>
                        </div>
                        <input
                          type="tel"
                          required
                          disabled={sameAsPhone}
                          value={sameAsPhone ? phone : whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none ${
                            sameAsPhone
                              ? "border-white/10 opacity-75 cursor-not-allowed"
                              : "border-white/15 focus:border-[#00E5FF]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Your Location (City & Country) <span className="text-[#FF5722]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Dubai, UAE / London, UK / Lagos, Nigeria"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Special Requests or Preferences (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Specific bottle preferences, birthday celebration, stage proximity..."
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>

                    {/* Submit CTA */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Submit EOI for {event.city} ({selectedPass}) via WhatsApp</span>
                      </button>
                      <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3 text-gray-500" />
                        <span>Submits your request to our festival director on WhatsApp & records your priority reservation.</span>
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

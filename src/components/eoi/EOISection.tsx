"use client";

import { useState } from "react";
import { 
  Flame, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Lock, 
  HelpCircle,
  MapPin,
  Calendar,
  Ticket,
  User,
  Crown
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { festivalEvents, getActiveEvent } from "@/data/events";
import { formatWhatsAppMessage, getWhatsAppUrl, saveLeadLocally, PassType } from "@/lib/whatsapp";

interface EOISectionProps {
  defaultEventSlug?: string;
  defaultPassType?: PassType;
  title?: string;
  subtitle?: string;
}

export default function EOISection({
  defaultEventSlug = "dubai",
  defaultPassType = "Table for 8",
  title,
  subtitle,
}: EOISectionProps) {
  const [selectedEventSlug, setSelectedEventSlug] = useState(defaultEventSlug);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [location, setLocation] = useState("");
  const [passType, setPassType] = useState<PassType>(defaultPassType);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState("");

  const currentEvent = festivalEvents.find((e) => e.slug === selectedEventSlug) || getActiveEvent();

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !location) {
      alert("Please fill in all required contact information.");
      return;
    }

    const finalWhatsApp = sameAsPhone ? phone : (whatsapp || phone);

    const customPhone =
      (typeof window !== "undefined" && localStorage.getItem("no_limit_fest_whatsapp_override")) ||
      siteConfig.defaultWhatsApp;

    const leadData = {
      eventName: `${currentEvent.name} (${currentEvent.city})`,
      name: fullName,
      email,
      phone,
      whatsapp: finalWhatsApp,
      location,
      passType,
      notes: notes.trim() || undefined,
    };

    // 1. Store lead locally
    saveLeadLocally(leadData);

    // 2. Format WhatsApp text
    const message = formatWhatsAppMessage(leadData);
    const targetUrl = getWhatsAppUrl(customPhone, message);
    setLastWhatsAppUrl(targetUrl);
    setSubmitted(true);

    // 3. Open WhatsApp in new tab/window
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

  const passOptions: { name: PassType; capacity: string; desc: string; icon: typeof User }[] = [
    {
      name: "Individual Pass",
      capacity: "1 Guest",
      desc: "Full festival access to all stages and culture villages",
      icon: User,
    },
    {
      name: "Table for 6",
      capacity: "6 Guests",
      desc: "Reserved VIP table, dedicated hostess, drinks credit",
      icon: Crown,
    },
    {
      name: "Table for 8",
      capacity: "8 Guests",
      desc: "Prime elevated VIP table with mainstage views & bottle service",
      icon: Crown,
    },
    {
      name: "Table for 10",
      capacity: "10 Guests",
      desc: "VVIP Waterfront Cabana with private butler & backstage access",
      icon: Crown,
    },
  ];

  return (
    <section id="eoi" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0A0C13] overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF5722]/20 to-[#FFD600]/20 border border-[#FF5722]/40 text-[#FF6E40] text-xs font-black uppercase tracking-widest">
            <Flame className="w-4 h-4 text-[#FF5722]" />
            <span>Priority Access & Presale Registration</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {title || (
              <>
                EXPRESSION OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]">INTEREST (EOI)</span>
              </>
            )}
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {subtitle ||
              "Choose between Individual Passes and private VIP tables for 6, 8, or 10. Submissions connect directly to our festival director via WhatsApp."}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#121522]/90 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF]" />

          {submitted ? (
            /* Success State */
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  You&apos;re On The VIP List!
                </h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto">
                  Your interest for <span className="text-[#FF5722] font-bold">{currentEvent.name}</span> ({passType}) has been registered and dispatched to our festival director on WhatsApp.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left text-xs space-y-1.5 text-gray-300">
                <p><strong className="text-white">Attendee:</strong> {fullName}</p>
                <p><strong className="text-white">Destination:</strong> {currentEvent.city} ({currentEvent.dates})</p>
                <p><strong className="text-white">Selected Pass:</strong> {passType}</p>
                <p><strong className="text-white">Origin Location:</strong> {location}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                {lastWhatsAppUrl && (
                  <a
                    href={lastWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Re-open WhatsApp Chat</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors"
                >
                  Register Another Guest / Event
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Select Festival Edition</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {festivalEvents.map((evt) => (
                    <button
                      type="button"
                      key={evt.id}
                      onClick={() => setSelectedEventSlug(evt.slug)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedEventSlug === evt.slug
                          ? "bg-[#FF5722]/15 border-[#FF5722] text-white shadow-lg shadow-orange-500/10"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{evt.flag}</span>
                        {evt.isCurrentEdition && (
                          <span className="text-[9px] font-black uppercase bg-[#FF5722] text-white px-2 py-0.5 rounded-full">
                            Flagship
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-white mt-1">{evt.city}</p>
                      <p className="text-[10px] text-gray-400 truncate">{evt.dates}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pass Tier Interest: Individual, Table for 6, Table for 8, Table for 10 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Select Pass or Table Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {passOptions.map((t) => {
                    const isSelected = passType === t.name;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setPassType(t.name)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-gradient-to-br from-[#FF5722]/20 to-[#FFD600]/10 border-[#FF5722] text-white ring-1 ring-[#FF5722]"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <Icon className={`w-4 h-4 ${isSelected ? "text-[#FFD600]" : "text-gray-400"}`} />
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                              {t.capacity}
                            </span>
                          </div>
                          <p className="font-bold text-xs text-white">{t.name}</p>
                          <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t.desc}</p>
                        </div>
                        <span className={`block text-[10px] font-black uppercase mt-3 pt-2 border-t border-white/10 ${isSelected ? "text-[#FF5722]" : "text-gray-500"}`}>
                          {isSelected ? "✓ Selected" : "Click to select"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Full Name <span className="text-[#FF5722]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Email Address <span className="text-[#FF5722]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alexander@example.com"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Phone Number (With Country Code) <span className="text-[#FF5722]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+971 50 123 4567 or +44 7911..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      WhatsApp Number <span className="text-[#FF5722]">*</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
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
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      sameAsPhone
                        ? "border-white/10 opacity-75 cursor-not-allowed"
                        : "border-white/15 focus:border-[#00E5FF]"
                    }`}
                  />
                </div>
              </div>

              {/* City / Country Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Your Current Location (City & Country) <span className="text-[#FF5722]">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dubai, UAE / London, UK / Lagos, NG / Miami, USA"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Special Requests or Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us any special hospitality requests, table placement preferences, or celebration notes..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722] transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>Submit EOI for {passType} & Connect on WhatsApp</span>
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>Your information is encrypted & directly transmitted to the festival director on WhatsApp.</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

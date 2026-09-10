"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Trash2, 
  Search, 
  MessageCircle, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Users, 
  Settings,
  Sparkles
} from "lucide-react";
import { EOILead, getStoredLeads, exportLeadsToCsv } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

interface LeadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadsDrawer({ isOpen, onClose }: LeadsDrawerProps) {
  const [leads, setLeads] = useState<EOILead[]>([]);
  const [search, setSearch] = useState("");
  const [customPhone, setCustomPhone] = useState(siteConfig.defaultWhatsApp);
  const [showConfig, setShowConfig] = useState(false);

  const refreshLeads = () => {
    setLeads(getStoredLeads());
  };

  useEffect(() => {
    if (isOpen) {
      refreshLeads();
      const savedPhone = localStorage.getItem("no_limit_fest_whatsapp_override");
      if (savedPhone) setCustomPhone(savedPhone);
    }
  }, [isOpen]);

  const handleSavePhone = (val: string) => {
    setCustomPhone(val);
    localStorage.setItem("no_limit_fest_whatsapp_override", val);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all stored leads from this device?")) {
      localStorage.removeItem("no_limit_fest_leads_v1");
      setLeads([]);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.eventName.toLowerCase().includes(q) ||
      (l.passType || l.ticketTier || "").toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0F111A] border-l border-white/10 shadow-2xl flex flex-col text-white">
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#151824]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  EOI Leads & WhatsApp Router
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {leads.length} total submissions stored on this browser session.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded-xl border transition-colors ${
                  showConfig 
                    ? "bg-[#FF5722] text-white border-[#FF5722]" 
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                }`}
                title="WhatsApp Destination Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Configuration Banner */}
          {showConfig && (
            <div className="p-4 bg-[#1C1F2E] border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#FFD600] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Target WhatsApp Phone Number</span>
                </label>
                <span className="text-[10px] text-gray-400 font-mono">Include country code</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => handleSavePhone(e.target.value)}
                  placeholder="+971506885946"
                  className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                All visitor EOI forms on this browser will route messages directly to this WhatsApp number.
              </p>
            </div>
          )}

          {/* Search & Actions Bar */}
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-[#121420]">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, city..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => exportLeadsToCsv(leads)}
                disabled={leads.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              {leads.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                  title="Clear Stored Leads"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 text-gray-500 space-y-3">
                <Users className="w-12 h-12 mx-auto text-gray-600" />
                <p className="text-sm font-semibold">No EOI Leads Found Yet</p>
                <p className="text-xs max-w-xs mx-auto">
                  When visitors submit the registration form, their full details appear here and automatically trigger a WhatsApp chat to your concierge.
                </p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-[#171A27] border border-white/10 hover:border-[#FF5722]/50 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#FF5722]/15 text-[#FF6E40] border border-[#FF5722]/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                        {lead.eventName}
                      </span>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{lead.name}</span>
                      </h3>
                    </div>

                    <a
                      href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${lead.name}, thank you for your interest in ${lead.eventName}! This is the No Limit Fest concierge.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat Back</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <a href={`mailto:${lead.email}`} className="hover:text-white truncate">
                        {lead.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span>{lead.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[#00E5FF] font-medium">{lead.passType || lead.ticketTier}</span>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-300 italic">
                      &ldquo;{lead.notes}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.createdAt).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {lead.id.slice(0, 14)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

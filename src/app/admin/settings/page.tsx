"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Check,
  HelpCircle,
  MessageCircle,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { DbSiteConfig } from "@/lib/data-service";
import { FAQItem } from "@/data/faq";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<DbSiteConfig | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 403 || res.status === 401) {
        setIsForbidden(true);
        return;
      }
      const data = await res.json();
      if (data.config) setConfig(data.config);
      if (data.faqs) setFaqs(data.faqs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, faqs }),
      });

      if (res.ok) {
        setNotification("Site settings and FAQs updated live!");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFaqChange = (
    index: number,
    field: "question" | "answer",
    val: string,
  ) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  if (isForbidden) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12 rounded-3xl bg-[#121524] border border-red-500/30 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Access Denied</h2>
        <p className="text-xs text-gray-400">
          You do not have permission to view or modify global site settings.
          This module is restricted to Super Administrators.
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8 text-center text-gray-500 text-xs">
        Loading festival configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
            Global Festival Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Site Settings &amp; FAQs
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure site-wide brand messaging, contact channels, ticker text,
            and attendee knowledgebase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Changes..." : "Publish All Changes"}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* SETTINGS FORM */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10 space-y-5 text-xs">
        <h3 className="text-sm font-black uppercase tracking-wider text-white">
          Brand &amp; Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Festival Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Brand Tagline Payoff
            </label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) =>
                setConfig({ ...config, tagline: e.target.value })
              }
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Default WhatsApp Concierge
            </label>
            <input
              type="text"
              value={config.defaultWhatsApp}
              onChange={(e) =>
                setConfig({ ...config, defaultWhatsApp: e.target.value })
              }
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Official Contact Email
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Age Limit Policy
            </label>
            <input
              type="text"
              value={config.ageLimit}
              onChange={(e) =>
                setConfig({ ...config, ageLimit: e.target.value })
              }
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-300 mb-1">
            Announcement Marquee Ticker (Runs across hero section)
          </label>
          <input
            type="text"
            value={config.marqueeText}
            onChange={(e) =>
              setConfig({ ...config, marqueeText: e.target.value })
            }
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-300 mb-1">
            Festival Description (SEO &amp; About)
          </label>
          <textarea
            rows={3}
            value={config.description}
            onChange={(e) =>
              setConfig({ ...config, description: e.target.value })
            }
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white leading-relaxed"
          />
        </div>
      </div>

      {/* POSTMARK EMAIL SERVER SETTINGS & DIAGNOSTICS */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10 space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
              Email Infrastructure
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Postmark Email Server (Transactional)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Delivers instant ticket QR passes, purchase confirmations, and
              gate notices via Postmark REST API.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Server: nolimitfest (ID: 20984046)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Postmark Server Token
            </label>
            <input
              type="text"
              readOnly
              value="0d3db4be-••••-••••-••••-6e2429d62213"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-gray-300 font-mono text-[11px] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Active Message Stream
            </label>
            <input
              type="text"
              readOnly
              value="outbound (Transactional)"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-gray-300 font-mono text-[11px] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Sender &quot;From&quot; Email Address
            </label>
            <input
              type="email"
              value={config.email || "tickets@nolimitfest.net"}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
              placeholder="tickets@nolimitfest.net"
            />
          </div>
        </div>

        {/* Live Test Email Tool */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FF5722]" />
              Send Live Postmark Diagnostic Test
            </span>
            <a
              href="https://account.postmarkapp.com/signatures"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#00E5FF] hover:underline"
            >
              Postmark Sender Signatures &rarr;
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              id="test-email-input"
              placeholder="Enter recipient email to receive test message..."
              defaultValue="info@nolimitfest.net"
              className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={async () => {
                const input = document.getElementById(
                  "test-email-input",
                ) as HTMLInputElement;
                const statusDiv = document.getElementById("test-email-status");
                if (!input || !input.value)
                  return alert("Please enter a recipient email.");
                if (statusDiv) {
                  statusDiv.innerText =
                    "Dispatching test message via Postmark REST API...";
                  statusDiv.className =
                    "text-xs font-mono text-cyan-400 mt-2 block";
                }
                try {
                  const res = await fetch("/api/admin/email/test", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      to: input.value,
                      fromEmail: config.email || "tickets@nolimitfest.net",
                    }),
                  });
                  const data = await res.json();
                  if (statusDiv) {
                    if (data.success) {
                      statusDiv.innerText = `✓ Delivered via Postmark! MessageID: ${data.messageId}`;
                      statusDiv.className =
                        "text-xs font-mono text-emerald-400 mt-2 block";
                    } else {
                      statusDiv.innerText = `Notice from Postmark (Code ${data.errorCode || 400}): ${data.message}`;
                      statusDiv.className =
                        "text-xs font-mono text-amber-400 mt-2 block";
                    }
                  }
                } catch {
                  if (statusDiv) {
                    statusDiv.innerText =
                      "Network failure communicating with API.";
                    statusDiv.className =
                      "text-xs font-mono text-rose-400 mt-2 block";
                  }
                }
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Dispatch Test Email
            </button>
          </div>
          <div
            id="test-email-status"
            className="hidden text-xs font-mono"
          ></div>
        </div>
      </div>

      {/* FAQS MANAGER */}
      <div className="p-6 rounded-3xl bg-[#121524] border border-white/10 space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Festival FAQ Knowledgebase ({faqs.length})
          </h3>
          <p className="text-xs text-gray-400">
            Edit answers displayed in the public FAQ section
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[#FF5722] uppercase">
                  {faq.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  FAQ #{index + 1}
                </span>
              </div>

              <input
                type="text"
                value={faq.question}
                onChange={(e) =>
                  handleFaqChange(index, "question", e.target.value)
                }
                className="w-full bg-transparent border-b border-white/10 py-1 text-sm font-bold text-white focus:outline-none focus:border-[#FF5722]"
              />

              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) =>
                  handleFaqChange(index, "answer", e.target.value)
                }
                className="w-full bg-transparent border border-white/10 rounded-xl p-2.5 text-xs text-gray-300 focus:outline-none focus:border-[#FF5722] leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

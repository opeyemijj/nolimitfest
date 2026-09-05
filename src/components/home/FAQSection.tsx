"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { festivalFaqs } from "@/data/faq";
import { siteConfig } from "@/config/site";

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("eoi-process");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Tickets & EOI", "Venue & Travel", "Festival Policies", "VIP & Tables", "Safety & Medical"];

  const filteredFaqs = festivalFaqs.filter((f) => {
    return activeCategory === "All" || f.category === activeCategory;
  });

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0D15] relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-black uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Essential Festival Knowledge</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            FREQUENTLY ASKED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF5722]">QUESTIONS</span>
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to know about the Dubai premiere, Expression of Interest, venue entry, and VIP accommodations.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#00E5FF] text-[#08090E] font-black shadow-md shadow-cyan-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-[#131624] border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#FF5722]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5 bg-black/20">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Direct Inquiries Help Box */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Have a specific question not listed here?</h4>
            <p className="text-xs text-gray-400">Our festival concierge team is available 24/7 on WhatsApp.</p>
          </div>
          <a
            href={`https://wa.me/${siteConfig.defaultWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              "Hi No Limit Fest concierge, I have a question regarding the festival."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat With Concierge</span>
          </a>
        </div>
      </div>
    </section>
  );
}

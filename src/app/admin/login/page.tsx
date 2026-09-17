"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@nolimitfest.com");
  const [password, setPassword] = useState("admin12345!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get("redirect");
        window.location.href = redirectParam || data.redirectUrl;
      } else {
        setError(data.error || "Invalid email or password.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network failure connecting to auth server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#FF5722]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="relative w-20 h-20 mx-auto">
            <Image
              src="/images/logo.png"
              alt="No Limit Fest"
              fill
              className="object-contain drop-shadow-[0_0_25px_rgba(255,87,34,0.6)]"
              priority
            />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Staff &amp; Backoffice Login
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Role-Protected Access for Directors, Organizers &amp; Gate Ushers
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121524] border border-white/10 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5722] via-[#FFD600] to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>
                {isLoading ? "Authenticating..." : "Sign In to Backoffice"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preset Roles Quick Selector for convenience */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block text-center">
              Quick Fill Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@nolimitfest.com");
                  setPassword("admin12345!");
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
              >
                <span className="font-bold text-white block">
                  👑 Super Admin
                </span>
                <span className="text-[10px] text-gray-400">
                  Full control &amp; revenue
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("gate@nolimitfest.com");
                  setPassword("gate12345!");
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
              >
                <span className="font-bold text-white block">
                  ⚡ Gate Staff
                </span>
                <span className="text-[10px] text-gray-400">
                  Scan &amp; check-in only
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Festival Guide
          </Link>
        </div>
      </div>
    </div>
  );
}

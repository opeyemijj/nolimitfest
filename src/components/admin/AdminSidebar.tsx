"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Ticket,
  Mic2,
  Layers,
  Settings,
  ShoppingBag,
  QrCode,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AuthUser, hasPermission, PermissionKey } from "@/lib/permissions";

interface AdminSidebarProps {
  user: AuthUser;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const allNavItems: {
    name: string;
    href: string;
    icon: any;
    permission: PermissionKey;
    highlight?: boolean;
  }[] = [
    {
      name: "Executive Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      permission: "dashboard",
    },
    {
      name: "Events Manager",
      href: "/admin/events",
      icon: Globe,
      permission: "events",
    },
    {
      name: "Ticket Tiers & Pricing",
      href: "/admin/tickets",
      icon: Ticket,
      permission: "tickets",
    },
    {
      name: "Lineup & Artists",
      href: "/admin/lineup",
      icon: Mic2,
      permission: "lineup",
    },
    {
      name: "Stages & Production",
      href: "/admin/stages",
      icon: Layers,
      permission: "stages",
    },
    {
      name: "Orders & Guestlist",
      href: "/admin/orders",
      icon: ShoppingBag,
      permission: "orders",
    },
    {
      name: "Ticket Buyers & CRM",
      href: "/admin/buyers",
      icon: Users,
      permission: "buyers",
    },
    {
      name: "Gate QR Scanner",
      href: "/admin/scan",
      icon: QrCode,
      highlight: true,
      permission: "scan",
    },
    {
      name: "Site Settings & FAQs",
      href: "/admin/settings",
      icon: Settings,
      permission: "settings",
    },
    {
      name: "Staff & Roles",
      href: "/admin/users",
      icon: ShieldCheck,
      permission: "users",
    },
  ];

  const navItems = allNavItems.filter((item) =>
    hasPermission(user, item.permission),
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0E111C] border-b border-white/10 sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo.png"
              alt="No Limit Fest"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-black text-sm uppercase tracking-wider text-white">
            NLF Backoffice
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/scan"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop & Mobile Overlay Drawer */}
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } md:block fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[#0E111C] border-r border-white/10 flex flex-col justify-between p-4 sm:p-5 md:h-screen md:overflow-y-auto`}
      >
        <div className="space-y-6">
          {/* Brand & Logo */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.png"
                  alt="No Limit Fest"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-black text-sm uppercase tracking-wider text-white block">
                  No Limit Fest
                </span>
                <span className="text-[10px] text-[#00E5FF] font-mono block">
                  Backoffice v2.0
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white truncate max-w-[130px]">
                {user.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  user.role === "SUPER_ADMIN"
                    ? "bg-[#FF5722] text-white"
                    : user.role === "ORGANIZER"
                      ? "bg-[#FFD600] text-black"
                      : "bg-emerald-500 text-black"
                }`}
              >
                {user.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-white shadow-lg shadow-orange-500/20 font-black"
                      : item.highlight
                        ? "bg-white/5 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 font-black"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>View Public Storefront</span>
            </span>
            <span className="text-[10px] text-gray-500">↗</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

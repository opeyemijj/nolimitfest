"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  Plus,
  Save,
  Edit3,
  Check,
  AlertCircle,
  Crown,
  Users,
  User,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { DbTicketTier } from "@/lib/data-service";

export default function AdminTicketsPage() {
  const [tiers, setTiers] = useState<DbTicketTier[]>([]);
  const [editingTier, setEditingTier] = useState<DbTicketTier | null>(null);
  const [editPerksText, setEditPerksText] = useState("");
  const [isNewTierModalOpen, setIsNewTierModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Tier form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"phase" | "group" | "table">(
    "phase",
  );
  const [newPrice, setNewPrice] = useState(150);
  const [newCapacity, setNewCapacity] = useState(500);
  const [newPax, setNewPax] = useState(1);
  const [newBadge, setNewBadge] = useState("");
  const [newPerks, setNewPerks] = useState(
    "Full admission to Helipad\nRUGER live headline show\nCommemorative wristband",
  );
  const [newColor, setNewColor] = useState("#00E676");
  const [newWristbandColor, setNewWristbandColor] = useState("NEON GREEN");

  const fetchTiers = async () => {
    try {
      const res = await fetch("/api/admin/tickets?eventId=dubai-2026");
      const data = await res.json();
      if (data.tiers) setTiers(data.tiers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    setIsSaving(true);

    try {
      const perksArray = editPerksText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingTier,
          perks: perksArray,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setNotification("Tier updated successfully!");
        setEditingTier(null);
        fetchTiers();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(`Failed to save tier: ${data.error || res.statusText || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Error saving tier: ${err.message || "Network error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const perksArray = newPerks
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "dubai-2026",
          name: newName,
          category: newCategory,
          price: newPrice,
          capacity: newCapacity,
          paxPerUnit: newPax,
          badge: newBadge,
          perks: perksArray,
          status: "active",
          color: newColor,
          wristbandColor: newWristbandColor,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setNotification("New ticket tier created!");
        setIsNewTierModalOpen(false);
        setNewName("");
        fetchTiers();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(`Failed to create tier: ${data.error || res.statusText || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Error creating tier: ${err.message || "Network error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722]">
            Inventory &amp; Pricing Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Ticket Tiers &amp; Passes
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure live prices (AED), stock allocations, status, and perk
            bullet points.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewTierModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Tier</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* TIERS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const remaining = tier.capacity - tier.soldCount;
          return (
            <div
              key={tier.id}
              className="rounded-2xl p-5 border border-white/10 bg-[#121524] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase">
                    {tier.paxPerUnit}{" "}
                    {tier.paxPerUnit === 1 ? "Guest" : "Guests"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      tier.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : tier.status === "sold_out"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {tier.status}
                  </span>
                </div>

                <h4 className="text-base font-black text-white flex items-center gap-1.5">
                  {tier.category === "table" || tier.isVVIP ? (
                    <Crown className="w-4 h-4 text-[#FFD600]" />
                  ) : (
                    <User className="w-4 h-4 text-[#00E5FF]" />
                  )}
                  <span>{tier.name}</span>
                </h4>

                <p className="text-2xl font-black text-[#FFD600] font-mono mt-1">
                  {tier.currency} {tier.price.toLocaleString()}
                </p>

                {/* Assigned Wristband Color Badge */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm shrink-0"
                    style={{ backgroundColor: tier.color || "#00E676" }}
                  />
                  <span
                    className="text-[11px] font-black uppercase tracking-wider font-mono"
                    style={{ color: tier.color || "#00E676" }}
                  >
                    {tier.wristbandColor || "NEON GREEN"} WRISTBAND
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>
                      Sold:{" "}
                      <strong className="text-white">{tier.soldCount}</strong>
                    </span>
                    <span>
                      Remaining:{" "}
                      <strong className="text-emerald-400">{remaining}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF5722] to-[#FFD600] h-1.5 rounded-full"
                      style={{
                        width: `${(tier.soldCount / tier.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {tier.perks && (
                  <ul className="mt-3 space-y-1 text-xs text-gray-300">
                    {tier.perks.slice(0, 2).map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-[11px] text-gray-400"
                      >
                        <span className="text-[#FF5722]">•</span>
                        <span className="line-clamp-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/buyers?eventId=dubai-2026&tierId=${tier.id}`}
                  className="px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="View all buyers and attendees for this tier"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Guests ({tier.soldCount})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTier(tier);
                    setEditPerksText(Array.isArray(tier.perks) ? tier.perks.join("\n") : "");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Pricing</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT MODAL */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722]">
                  Tier Configurator
                </span>
                <h3 className="text-xl font-black text-white">
                  Edit {editingTier.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTier(null)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    value={editingTier.name}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Price (AED)
                  </label>
                  <input
                    type="number"
                    value={editingTier.price}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Total Capacity / Stock
                  </label>
                  <input
                    type="number"
                    value={editingTier.capacity}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        capacity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingTier.status}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">Active (Selling Now)</option>
                    <option value="upcoming">Upcoming (Locked)</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={editingTier.badge || ""}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, badge: e.target.value })
                    }
                    placeholder="e.g. Selling Fast • Best Deal"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Guests Included (Pax)
                  </label>
                  <input
                    type="number"
                    value={editingTier.paxPerUnit}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        paxPerUnit: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Wristband Color Name
                  </label>
                  <input
                    type="text"
                    value={editingTier.wristbandColor || "NEON GREEN"}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        wristbandColor: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. NEON GREEN, ROYAL GOLD VIP"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Wristband Hex Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTier.color || "#00E676"}
                      onChange={(e) =>
                        setEditingTier({
                          ...editingTier,
                          color: e.target.value,
                        })
                      }
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={editingTier.color || "#00E676"}
                      onChange={(e) =>
                        setEditingTier({
                          ...editingTier,
                          color: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Table Deposit Configuration Option */}
              {(editingTier.category === "table" || editingTier.isVVIP) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-300">
                        Table Reservation Deposit
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Allow guests to reserve with 20% deposit (or
                        configurable %)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTier.allowDeposit ?? true}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            allowDeposit: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FFD600]"></div>
                    </label>
                  </div>

                  {(editingTier.allowDeposit ?? true) && (
                    <div className="flex items-center gap-3 pt-2 border-t border-amber-500/20">
                      <label className="text-xs text-gray-300 font-bold whitespace-nowrap">
                        Deposit Percentage (%):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={editingTier.depositPercentage ?? 20}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            depositPercentage: parseFloat(e.target.value) || 20,
                          })
                        }
                        className="w-24 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-white font-mono text-xs"
                      />
                      <span className="text-[11px] text-[#FFD600] font-mono font-bold">
                        = {editingTier.currency || "AED"}{" "}
                        {Math.round(
                          (editingTier.price *
                            (editingTier.depositPercentage ?? 20)) /
                            100,
                        ).toLocaleString()}{" "}
                        deposit
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Perks (One per line)
                </label>
                <textarea
                  rows={4}
                  value={editPerksText}
                  onChange={(e) => setEditPerksText(e.target.value)}
                  placeholder="e.g. VIP Fast-track entry&#10;Access to artist lounge&#10;Complimentary beverage token"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Tier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW TIER MODAL */}
      {isNewTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722]">
                  New Inventory Allocation
                </span>
                <h3 className="text-xl font-black text-white">
                  Create Ticket Tier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTierModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. VIP Backstage Pass"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="phase">General Admission Phase</option>
                    <option value="group">Squad / Group Pass</option>
                    <option value="table">VIP Table Package</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Price (AED)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    required
                    value={newCapacity}
                    onChange={(e) =>
                      setNewCapacity(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Wristband Color Name
                  </label>
                  <input
                    type="text"
                    value={newWristbandColor}
                    onChange={(e) =>
                      setNewWristbandColor(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. NEON GREEN, ROYAL GOLD VIP"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Wristband Hex Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Perks (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newPerks}
                  onChange={(e) => setNewPerks(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewTierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? "Creating..." : "Create Tier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Globe,
  Calendar,
  MapPin,
  Sparkles,
  Save,
  Check,
  Edit3,
  AlertCircle,
  Clock,
  Layers,
  Users,
} from "lucide-react";
import { DbEvent } from "@/lib/data-service";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent),
      });

      if (res.ok) {
        setSaveMessage("Event updated successfully!");
        fetchEvents();
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err) {
      alert("Failed to update event.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
            Multi-City Tour Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Events Manager
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure dates, venues, status, and capacities for all festival
            editions worldwide.
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* EVENTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className={`rounded-2xl p-5 border bg-[#121524] flex flex-col justify-between transition-all ${
              evt.isCurrentEdition
                ? "border-[#FF5722] ring-1 ring-[#FF5722]/40"
                : "border-white/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{evt.flag}</span>
                  <span className="font-black text-sm text-white">
                    {evt.city}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {evt.isCurrentEdition ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF5722] text-white text-[9px] font-black uppercase">
                      Flagship
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        evt.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {evt.status}
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-base font-black text-white">{evt.name}</h4>
              <p className="text-xs text-[#FFD600] font-medium mt-0.5 line-clamp-1">
                {evt.edition}
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
                  <span className="truncate">{evt.dates}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {evt.expectedAttendance}
              </span>
              <button
                type="button"
                onClick={() => setEditingEvent(evt)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Specs</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722]">
                  Event Configuration
                </span>
                <h3 className="text-xl font-black text-white">
                  Edit {editingEvent.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={editingEvent.name}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Edition Title
                  </label>
                  <input
                    type="text"
                    value={editingEvent.edition}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        edition: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Dates
                  </label>
                  <input
                    type="text"
                    value={editingEvent.dates}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        dates: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Hours / Time
                  </label>
                  <input
                    type="text"
                    value={editingEvent.time}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, time: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">Active (Selling)</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="announced">Announced</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={editingEvent.venue}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Venue Address
                  </label>
                  <input
                    type="text"
                    value={editingEvent.address}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        address: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingEvent.tagline}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      tagline: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Expected Attendance
                  </label>
                  <input
                    type="text"
                    value={editingEvent.expectedAttendance}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        expectedAttendance: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={editingEvent.heroImage}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        heroImage: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEvent.isCurrentEdition}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      isCurrentEdition: e.target.checked,
                    })
                  }
                  className="rounded border-gray-600 text-[#FF5722]"
                />
                <span className="font-bold text-white">
                  Set as Primary Flagship Edition (Promoted on Homepage)
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
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
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

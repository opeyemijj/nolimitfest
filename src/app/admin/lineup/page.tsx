"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Mic2,
  Plus,
  Edit3,
  Save,
  Check,
  Music,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Artist } from "@/data/artists";

export default function AdminLineupPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/admin/lineup");
      const data = await res.json();
      if (data.artists) setArtists(data.artists);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/lineup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArtist),
      });

      if (res.ok) {
        setNotification("Artist schedule updated!");
        setEditingArtist(null);
        fetchArtists();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      alert("Failed to save artist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
            Festival Programming
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Artists &amp; Lineup
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage festival performers, stage allocations, set times, and bios.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* ARTISTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="rounded-2xl border border-white/10 bg-[#121524] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-black/40">
                <Image
                  src={artist.image || "/images/artists/ruger.jpg"}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121524] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase text-white">
                    {artist.role}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF5722] text-white text-[10px] font-black uppercase">
                    {artist.genre}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-xl font-black text-white">
                    {artist.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {artist.origin}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
                    <span className="font-bold text-white">{artist.time}</span>
                    <span className="text-gray-500">({artist.day})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                    <span>{artist.stage}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {artist.bio}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-white/10 flex items-center justify-between mt-4">
              <a
                href={artist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Spotify</span>
              </a>

              <button
                type="button"
                onClick={() => setEditingArtist(artist)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Schedule</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF]">
                  Lineup Programming
                </span>
                <h3 className="text-xl font-black text-white">
                  Edit {editingArtist.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingArtist(null)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={editingArtist.name}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Role / Billing
                  </label>
                  <select
                    value={editingArtist.role}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Headliner">Headliner</option>
                    <option value="Supporting Act">Supporting Act</option>
                    <option value="Special Guest">Special Guest</option>
                    <option value="Undercard">Undercard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Stage
                  </label>
                  <input
                    type="text"
                    value={editingArtist.stage}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        stage: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Set Time
                  </label>
                  <input
                    type="text"
                    value={editingArtist.time}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        time: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={editingArtist.genre}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        genre: e.target.value as any,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Origin / City
                  </label>
                  <input
                    type="text"
                    value={editingArtist.origin}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        origin: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Artist Bio
                </label>
                <textarea
                  rows={3}
                  value={editingArtist.bio}
                  onChange={(e) =>
                    setEditingArtist({ ...editingArtist, bio: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editingArtist.image}
                  onChange={(e) =>
                    setEditingArtist({
                      ...editingArtist,
                      image: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingArtist(null)}
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
                  <span>{isSaving ? "Saving..." : "Save Artist"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { Artist } from "@/data/artists";

export default function AdminLineupPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deletion state
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Addition state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({
    name: "",
    role: "Supporting Act",
    genre: "Afrobeats",
    day: "Day 1",
    stage: "Helipad Mainstage",
    time: "9:00 PM",
    image: "/images/artists/ruger.jpg",
    bio: "",
    origin: "Dubai, UAE",
    hits: [],
    spotifyUrl: "",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/admin/lineup");
      const data = await res.json();
      if (data.artists) setArtists(data.artists);
    } catch (err) {
      console.error("Error fetching artists:", err);
    } finally {
      setIsLoading(false);
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
        setNotification({
          type: "success",
          message: `Schedule for "${editingArtist.name}" updated!`,
        });
        setEditingArtist(null);
        await fetchArtists();
      } else {
        const data = await res.json().catch(() => ({}));
        setNotification({
          type: "error",
          message: data.error || "Failed to update artist.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Network error saving artist.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleDelete = async () => {
    if (!artistToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/lineup?id=${encodeURIComponent(artistToDelete.id)}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message:
            data.message ||
            `Artist "${artistToDelete.name}" removed from lineup.`,
        });
        setArtistToDelete(null);
        if (editingArtist?.id === artistToDelete.id) {
          setEditingArtist(null);
        }
        await fetchArtists();
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to delete artist.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Network error deleting artist.",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtist.name?.trim()) {
      alert("Artist name is required.");
      return;
    }
    setIsAdding(true);

    try {
      const res = await fetch("/api/admin/lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArtist),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message: `Performer "${newArtist.name}" added to lineup!`,
        });
        setIsAddModalOpen(false);
        setNewArtist({
          name: "",
          role: "Supporting Act",
          genre: "Afrobeats",
          day: "Day 1",
          stage: "Helipad Mainstage",
          time: "9:00 PM",
          image: "/images/artists/ruger.jpg",
          bio: "",
          origin: "Dubai, UAE",
          hits: [],
          spotifyUrl: "",
        });
        await fetchArtists();
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to add artist.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Network error adding artist.",
      });
    } finally {
      setIsAdding(false);
      setTimeout(() => setNotification(null), 3500);
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

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Performer</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/20 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white/60 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && artists.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-white/10 bg-[#121524] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
            <Mic2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Artists in Lineup</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Add performers to schedule them onto festival stages and publish them to the live festival guide.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add First Performer</span>
          </button>
        </div>
      )}

      {/* ARTISTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="rounded-2xl border border-white/10 bg-[#121524] overflow-hidden flex flex-col justify-between hover:border-white/20 transition-colors"
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
              {artist.spotifyUrl ? (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Spotify</span>
                </a>
              ) : (
                <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <Music className="w-3.5 h-3.5" />
                  <span>No link</span>
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingArtist(artist)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArtistToDelete(artist)}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                  title={`Delete ${artist.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
                    required
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

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Spotify URL
                </label>
                <input
                  type="text"
                  value={editingArtist.spotifyUrl || ""}
                  onChange={(e) =>
                    setEditingArtist({
                      ...editingArtist,
                      spotifyUrl: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const target = editingArtist;
                    setEditingArtist(null);
                    setArtistToDelete(target);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Artist</span>
                </button>

                <div className="flex items-center gap-2">
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
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PERFORMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF]">
                  Add Performer
                </span>
                <h3 className="text-xl font-black text-white">
                  Add Artist to Lineup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asake"
                    value={newArtist.name || ""}
                    onChange={(e) =>
                      setNewArtist({ ...newArtist, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Role / Billing
                  </label>
                  <select
                    value={newArtist.role || "Supporting Act"}
                    onChange={(e) =>
                      setNewArtist({
                        ...newArtist,
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
                    placeholder="Helipad Mainstage"
                    value={newArtist.stage || ""}
                    onChange={(e) =>
                      setNewArtist({ ...newArtist, stage: e.target.value })
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
                    placeholder="9:00 PM - 10:30 PM"
                    value={newArtist.time || ""}
                    onChange={(e) =>
                      setNewArtist({ ...newArtist, time: e.target.value })
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
                    placeholder="Afrobeats"
                    value={newArtist.genre || ""}
                    onChange={(e) =>
                      setNewArtist({
                        ...newArtist,
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
                    placeholder="Lagos, Nigeria"
                    value={newArtist.origin || ""}
                    onChange={(e) =>
                      setNewArtist({ ...newArtist, origin: e.target.value })
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
                  placeholder="Short artist biography..."
                  value={newArtist.bio || ""}
                  onChange={(e) =>
                    setNewArtist({ ...newArtist, bio: e.target.value })
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
                  placeholder="/images/artists/ruger.jpg or https://..."
                  value={newArtist.image || ""}
                  onChange={(e) =>
                    setNewArtist({ ...newArtist, image: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Spotify URL
                </label>
                <input
                  type="text"
                  placeholder="https://open.spotify.com/artist/..."
                  value={newArtist.spotifyUrl || ""}
                  onChange={(e) =>
                    setNewArtist({ ...newArtist, spotifyUrl: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isAdding ? "Adding..." : "Add to Lineup"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {artistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#121524] border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl shadow-red-950/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  Remove from Lineup?
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-bold text-white">
                    {artistToDelete.name}
                  </span>{" "}
                  from the festival lineup?
                </p>
              </div>
            </div>

            {/* ARTIST PREVIEW CARD */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 shrink-0">
                <Image
                  src={artistToDelete.image || "/images/artists/ruger.jpg"}
                  alt={artistToDelete.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white truncate">
                  {artistToDelete.name}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {artistToDelete.role} • {artistToDelete.stage} ({artistToDelete.time})
                </p>
              </div>
            </div>

            <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              This action cannot be undone. This performer will be permanently deleted from the database and will no longer appear on the public lineup.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setArtistToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Remove Artist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

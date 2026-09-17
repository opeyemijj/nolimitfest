"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Layers,
  Edit3,
  Save,
  Check,
  Music,
  Volume2,
  Sparkles,
  Flame,
} from "lucide-react";
import { Stage } from "@/data/stages";

export default function AdminStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStages = async () => {
    try {
      const res = await fetch("/api/admin/stages");
      const data = await res.json();
      if (data.stages) setStages(data.stages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/stages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStage),
      });

      if (res.ok) {
        setNotification("Stage specs updated!");
        setEditingStage(null);
        fetchStages();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      alert("Failed to save stage specs.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD600]">
          Venue Infrastructure
        </span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Stages &amp; Production Specs
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Configure stage architectures, audio arrays, lighting, and
          pyrotechnics.
        </p>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* STAGES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="rounded-2xl border border-white/10 bg-[#121524] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-black/40">
                <Image
                  src={stage.image}
                  alt={stage.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121524] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase text-white">
                    {stage.capacity}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-xl font-black text-white">
                    {stage.name}
                  </h4>
                  <p className="text-xs text-[#FF5722] font-bold mt-0.5">
                    {stage.subtitle}
                  </p>
                </div>

                <p className="text-xs text-gray-300 line-clamp-2">
                  {stage.description}
                </p>

                {/* Production Specs */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-gray-300">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Audio System
                  </p>
                  <p className="text-white font-medium truncate">
                    {stage.production?.audio}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mt-2">
                    Visuals &amp; Lighting
                  </p>
                  <p className="text-white font-medium truncate">
                    {stage.production?.lighting}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-white/10 flex items-center justify-end mt-4">
              <button
                type="button"
                onClick={() => setEditingStage(stage)}
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
      {editingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD600]">
                  Stage Engineering
                </span>
                <h3 className="text-xl font-black text-white">
                  Edit {editingStage.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStage(null)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={editingStage.name}
                    onChange={(e) =>
                      setEditingStage({ ...editingStage, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingStage.subtitle}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingStage.description}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Audio Production Array
                </label>
                <input
                  type="text"
                  value={editingStage.production?.audio || ""}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      production: {
                        ...editingStage.production,
                        audio: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Lighting &amp; Lasers
                </label>
                <input
                  type="text"
                  value={editingStage.production?.lighting || ""}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      production: {
                        ...editingStage.production,
                        lighting: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingStage(null)}
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
                  <span>{isSaving ? "Saving..." : "Save Specs"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

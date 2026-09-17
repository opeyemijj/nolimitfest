"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Check,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Key,
  Globe,
  Tag,
  Eye,
  X,
  Search,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import {
  AuthUser,
  UserRole,
  PermissionKey,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from "@/lib/permissions";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: number;
  permissions: PermissionKey[];
  assignedEvents: string[];
  createdAt: string;
  updatedAt?: string;
}

interface EventOption {
  id: string;
  name: string;
  city: string;
  country: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    permissions: PermissionKey[];
    assignedEventsMode: "ALL" | "SPECIFIC";
    specificEvents: string[];
  }>({
    name: "",
    email: "",
    password: "",
    role: "GATE_STAFF",
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS.GATE_STAFF,
    assignedEventsMode: "ALL",
    specificEvents: [],
  });

  const [activeTab, setActiveTab] = useState<
    "profile" | "permissions" | "events"
  >("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        if (res.status === 403) {
          setErrorMessage(
            "Access Denied: Only Super Administrators can view and manage staff accounts.",
          );
          return;
        }
        throw new Error("Failed to fetch staff data");
      }
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (data.events) setEvents(data.events);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load staff list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && u.isActive !== 1) return false;
      if (statusFilter === "INACTIVE" && u.isActive === 1) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("CREATE");
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "GATE_STAFF",
      isActive: true,
      permissions: [...ROLE_DEFAULT_PERMISSIONS.GATE_STAFF],
      assignedEventsMode: "ALL",
      specificEvents: [],
    });
    setActiveTab("profile");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: StaffUser) => {
    setModalMode("EDIT");
    setEditingUserId(user.id);
    const isAllEvents =
      !user.assignedEvents ||
      user.assignedEvents.includes("ALL") ||
      user.assignedEvents.length === 0;

    setFormData({
      name: user.name,
      email: user.email,
      password: "", // empty means keep existing
      role: user.role,
      isActive: user.isActive === 1,
      permissions: [
        ...(user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role] || []),
      ],
      assignedEventsMode: isAllEvents ? "ALL" : "SPECIFIC",
      specificEvents: isAllEvents ? [] : user.assignedEvents,
    });
    setActiveTab("profile");
    setIsModalOpen(true);
  };

  // When changing role in modal, update recommended permissions
  const handleRoleChange = (newRole: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: [...ROLE_DEFAULT_PERMISSIONS[newRole]],
    }));
  };

  // Toggle individual permission checkbox
  const handleTogglePermission = (key: PermissionKey) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(key);
      const nextPermissions = exists
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: nextPermissions };
    });
  };

  // Reset permissions to default for current role
  const handleResetToRoleDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [...ROLE_DEFAULT_PERMISSIONS[prev.role]],
    }));
  };

  // Toggle assigned event checkbox
  const handleToggleEvent = (eventId: string) => {
    setFormData((prev) => {
      const exists = prev.specificEvents.includes(eventId);
      const nextEvents = exists
        ? prev.specificEvents.filter((e) => e !== eventId)
        : [...prev.specificEvents, eventId];
      return { ...prev, specificEvents: nextEvents };
    });
  };

  // Submit Create or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const assignedEvents =
        formData.assignedEventsMode === "ALL"
          ? ["ALL"]
          : formData.specificEvents.length > 0
            ? formData.specificEvents
            : ["ALL"];

      if (modalMode === "CREATE") {
        if (!formData.password) {
          alert("Password is required for new staff accounts.");
          setIsSubmitting(false);
          return;
        }

        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            permissions: formData.permissions,
            assignedEvents,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setNotification(`✓ Created staff account for ${formData.name}`);
          setIsModalOpen(false);
          fetchUsers();
        } else {
          alert(data.error || "Failed to create staff account.");
        }
      } else {
        // EDIT
        const res = await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUserId,
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined,
            role: formData.role,
            isActive: formData.isActive ? 1 : 0,
            permissions: formData.permissions,
            assignedEvents,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setNotification(`✓ Updated staff account for ${formData.name}`);
          setIsModalOpen(false);
          fetchUsers();
        } else {
          alert(data.error || "Failed to update staff account.");
        }
      }
    } catch {
      alert("Network error processing request.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Delete Staff Member
  const handleDeleteUser = async (userToDelete: StaffUser) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the staff account for ${userToDelete.name} (${userToDelete.email})?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`✓ Staff account for ${userToDelete.name} deleted.`);
        if (isModalOpen && editingUserId === userToDelete.id) {
          setIsModalOpen(false);
        }
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete account.");
      }
    } catch {
      alert("Network error deleting account.");
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Quick Toggle Active / Deactive
  const handleQuickToggleActive = async (u: StaffUser) => {
    const newActiveState = u.isActive === 1 ? 0 : 1;
    const actionLabel = newActiveState === 1 ? "activate" : "deactivate";

    if (
      !confirm(`Are you sure you want to ${actionLabel} ${u.name}'s account?`)
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: newActiveState,
          permissions: u.permissions,
          assignedEvents: u.assignedEvents,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(
          `✓ Account for ${u.name} is now ${newActiveState === 1 ? "Active" : "Deactivated"}.`,
        );
        fetchUsers();
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Error contacting server.");
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (errorMessage) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 rounded-3xl bg-[#121524] border border-red-500/30 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Access Denied</h2>
        <p className="text-xs text-gray-400">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722]">
            Role-Based Access Control (RBAC)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Staff &amp; Role Management
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure accounts, assign granular module permissions, and restrict
            festival city access for Directors, Organizers, and Gate Door Staff.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Staff Accounts
            </span>
            <Users className="w-4 h-4 text-[#FF5722]" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {users.length}
          </p>
          <p className="text-[10px] text-gray-400">
            Authorized backoffice users
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Super Admins
            </span>
            <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
          </div>
          <p className="text-2xl font-black text-[#FF5722] font-mono">
            {users.filter((u) => u.role === "SUPER_ADMIN").length}
          </p>
          <p className="text-[10px] text-gray-400">Unrestricted full control</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Organizers
            </span>
            <Tag className="w-4 h-4 text-[#FFD600]" />
          </div>
          <p className="text-2xl font-black text-[#FFD600] font-mono">
            {users.filter((u) => u.role === "ORGANIZER").length}
          </p>
          <p className="text-[10px] text-gray-400">
            Events, Lineup, Orders &amp; CRM
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Gate Staff
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {users.filter((u) => u.role === "GATE_STAFF").length}
          </p>
          <p className="text-[10px] text-gray-400">
            Scanning &amp; Door Check-In Only
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="p-4 rounded-2xl bg-[#121524] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FF5722]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 text-[11px]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#1A1D2E] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="GATE_STAFF">Gate Staff</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1D2E] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="rounded-2xl border border-white/10 bg-[#121524] overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#FF5722] animate-spin" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Loading staff directory...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-xs text-gray-400">
              No staff members match the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role &amp; Title</th>
                  <th className="py-3 px-4">Assigned Events</th>
                  <th className="py-3 px-4">Permissions Scope</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isAllEvents =
                    !u.assignedEvents ||
                    u.assignedEvents.includes("ALL") ||
                    u.assignedEvents.length === 0;

                  const permsCount = u.permissions ? u.permissions.length : 0;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/10 to-white/20 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                            {u.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-gray-400 block font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-[#FF5722] text-white shadow-sm shadow-orange-500/20"
                              : u.role === "ORGANIZER"
                                ? "bg-[#FFD600] text-black shadow-sm shadow-amber-500/20"
                                : "bg-emerald-500 text-black"
                          }`}
                        >
                          {u.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Assigned Events */}
                      <td className="py-3.5 px-4">
                        {isAllEvents ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold">
                            <Globe className="w-3 h-3 text-[#00E5FF]" />
                            <span>All World Tour Cities</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {u.assignedEvents.map((evId) => {
                              const ev = events.find((e) => e.id === evId);
                              return (
                                <span
                                  key={evId}
                                  className="px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-[9px] font-bold"
                                >
                                  {ev ? ev.city : evId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Permissions Scope */}
                      <td className="py-3.5 px-4">
                        {u.role === "SUPER_ADMIN" ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            Full Access (10/10 Modules)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono">
                            {permsCount} of 10 Modules Allowed
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isActive === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                            <X className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            title="Edit Staff Member, Role & Permissions"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickToggleActive(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.isActive === 1
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                            title={
                              u.isActive === 1
                                ? "Suspend Account"
                                : "Activate Account"
                            }
                          >
                            {u.isActive === 1 ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT & CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121524] border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722]">
                  {modalMode === "CREATE"
                    ? "New Account"
                    : "Account Configurator"}
                </span>
                <h3 className="text-xl font-black text-white">
                  {modalMode === "CREATE"
                    ? "Add Staff Member"
                    : `Edit Staff: ${formData.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === "profile"
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                1. Profile &amp; Role
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("permissions")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === "permissions"
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                2. Module Permissions ({formData.permissions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === "events"
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                3. Event Scope (
                {formData.assignedEventsMode === "ALL"
                  ? "All"
                  : formData.specificEvents.length}
                )
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* TAB 1: Profile & Credentials */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. John Gate Supervisor"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="staff@nolimitfest.com"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Operational Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          handleRoleChange(e.target.value as UserRole)
                        }
                        className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="GATE_STAFF">
                          Gate Staff (Scan &amp; Check In Only)
                        </option>
                        <option value="ORGANIZER">
                          Organizer (Events, Lineup, Orders &amp; CRM)
                        </option>
                        <option value="SUPER_ADMIN">
                          Super Admin (Unrestricted Full Access)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Account Status
                      </label>
                      <select
                        value={formData.isActive ? "1" : "0"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.value === "1",
                          })
                        }
                        className="w-full bg-[#1A1D2E] border border-white/15 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="1">Active (Can Sign In)</option>
                        <option value="0">Suspended / Deactivated</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-300 mb-1">
                      {modalMode === "CREATE"
                        ? "Account Password *"
                        : "Reset Password (Leave blank to keep existing)"}
                    </label>
                    <input
                      type="password"
                      required={modalMode === "CREATE"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        modalMode === "CREATE"
                          ? "Enter temporary password"
                          : "Leave blank to keep current password"
                      }
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Module Permissions */}
              {activeTab === "permissions" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                      Select which backoffice modules this staff member can
                      access.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetToRoleDefaults}
                      className="text-[10px] text-[#00E5FF] hover:underline font-bold"
                    >
                      Reset to {formData.role.replace("_", " ")} Defaults
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {ALL_PERMISSIONS.map((perm) => {
                      const checked = formData.permissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                            checked
                              ? "bg-white/10 border-[#FF5722]/50 text-white"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="mt-0.5 rounded accent-[#FF5722]"
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs block text-white">
                              {perm.label}
                            </span>
                            <span className="text-[10px] text-gray-400 block line-clamp-2">
                              {perm.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Event Scope */}
              {activeTab === "events" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block font-bold text-gray-300">
                      Festival City Assignment Scope:
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                          formData.assignedEventsMode === "ALL"
                            ? "bg-white/10 border-[#00E5FF] text-white"
                            : "bg-white/5 border-white/10 text-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventScope"
                          checked={formData.assignedEventsMode === "ALL"}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              assignedEventsMode: "ALL",
                            })
                          }
                          className="accent-[#00E5FF]"
                        />
                        <span className="font-bold text-xs">
                          All World Tour Cities
                        </span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                          formData.assignedEventsMode === "SPECIFIC"
                            ? "bg-white/10 border-[#00E5FF] text-white"
                            : "bg-white/5 border-white/10 text-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventScope"
                          checked={formData.assignedEventsMode === "SPECIFIC"}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              assignedEventsMode: "SPECIFIC",
                            })
                          }
                          className="accent-[#00E5FF]"
                        />
                        <span className="font-bold text-xs">
                          Specific Events Only
                        </span>
                      </label>
                    </div>
                  </div>

                  {formData.assignedEventsMode === "SPECIFIC" && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <p className="text-[11px] text-gray-400">
                        Check the specific festival editions this staff member
                        is assigned to manage or check in:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {events.map((ev) => {
                          const checked = formData.specificEvents.includes(
                            ev.id,
                          );
                          return (
                            <label
                              key={ev.id}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                                checked
                                  ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 text-white"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleEvent(ev.id)}
                                className="accent-[#00E5FF]"
                              />
                              <div className="truncate">
                                <span className="font-bold text-xs block text-white">
                                  {ev.name}
                                </span>
                                <span className="text-[10px] text-gray-400 block">
                                  {ev.city}, {ev.country}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  {modalMode === "EDIT" && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = users.find(
                          (u) => u.id === editingUserId,
                        );
                        if (target) handleDeleteUser(target);
                      }}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
                    >
                      Delete Account
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FFD600] text-black font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? "Saving..."
                        : modalMode === "CREATE"
                          ? "Create Account"
                          : "Save Changes"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export type UserRole = "SUPER_ADMIN" | "ORGANIZER" | "GATE_STAFF";

export type PermissionKey =
  | "dashboard"
  | "events"
  | "tickets"
  | "lineup"
  | "stages"
  | "orders"
  | "buyers"
  | "scan"
  | "settings"
  | "users";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: number | boolean;
  permissions?: PermissionKey[];
  assignedEvents?: string[];
}

export const ALL_PERMISSIONS: {
  key: PermissionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "dashboard",
    label: "Executive Dashboard",
    description: "View revenue metrics, ticket sales count & analytics",
  },
  {
    key: "events",
    label: "Events Manager",
    description: "Configure festival cities, dates, venues, and status",
  },
  {
    key: "tickets",
    label: "Ticket Tiers & Pricing",
    description: "Manage pricing, allocations, perks, and sales status",
  },
  {
    key: "lineup",
    label: "Lineup & Artists",
    description: "Manage artist bookings, headliners, set times, and billing",
  },
  {
    key: "stages",
    label: "Stages & Production",
    description: "Manage festival stages, capacity, and production specs",
  },
  {
    key: "orders",
    label: "Orders & Guestlist",
    description: "Search orders, lookup guests, issue complimentary passes",
  },
  {
    key: "buyers",
    label: "Ticket Buyers CRM",
    description: "Audience database, WhatsApp contact, Excel export",
  },
  {
    key: "scan",
    label: "Gate QR Scanner",
    description: "Continuous camera door check-in & wristband management",
  },
  {
    key: "settings",
    label: "Site Settings & FAQs",
    description: "Site announcement text, FAQs, Postmark email server",
  },
  {
    key: "users",
    label: "Staff & Role Management",
    description: "Create & edit staff accounts, assign permissions & events",
  },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    "dashboard",
    "events",
    "tickets",
    "lineup",
    "stages",
    "orders",
    "buyers",
    "scan",
    "settings",
    "users",
  ],
  ORGANIZER: [
    "dashboard",
    "events",
    "tickets",
    "lineup",
    "stages",
    "orders",
    "buyers",
    "scan",
  ],
  GATE_STAFF: ["scan", "orders"],
};

export function getUserPermissions(user: AuthUser): PermissionKey[] {
  if (user.role === "SUPER_ADMIN") {
    return ROLE_DEFAULT_PERMISSIONS.SUPER_ADMIN;
  }
  if (
    user.permissions &&
    Array.isArray(user.permissions) &&
    user.permissions.length > 0
  ) {
    return user.permissions;
  }
  return ROLE_DEFAULT_PERMISSIONS[user.role] || ["scan"];
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: PermissionKey,
): boolean {
  if (!user || !user.isActive) return false;
  if (user.role === "SUPER_ADMIN") return true;
  const perms = getUserPermissions(user);
  return perms.includes(permission);
}

export function getUserAssignedEvents(user: AuthUser): string[] {
  if (user.role === "SUPER_ADMIN") return ["ALL"];
  if (
    user.assignedEvents &&
    Array.isArray(user.assignedEvents) &&
    user.assignedEvents.length > 0
  ) {
    return user.assignedEvents;
  }
  return ["ALL"];
}

export function canAccessEvent(
  user: AuthUser | null | undefined,
  eventId: string,
): boolean {
  if (!user || !user.isActive) return false;
  if (user.role === "SUPER_ADMIN") return true;
  const events = getUserAssignedEvents(user);
  if (events.includes("ALL")) return true;
  return events.includes(eventId);
}

export function canCheckIn(roleOrUser?: UserRole | AuthUser): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === "string") {
    return (
      roleOrUser === "SUPER_ADMIN" ||
      roleOrUser === "ORGANIZER" ||
      roleOrUser === "GATE_STAFF"
    );
  }
  return (
    hasPermission(roleOrUser, "scan") || hasPermission(roleOrUser, "orders")
  );
}

export function canManageContent(roleOrUser?: UserRole | AuthUser): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === "string") {
    return roleOrUser === "SUPER_ADMIN" || roleOrUser === "ORGANIZER";
  }
  return (
    hasPermission(roleOrUser, "events") ||
    hasPermission(roleOrUser, "tickets") ||
    hasPermission(roleOrUser, "lineup")
  );
}

export function isSuperAdmin(roleOrUser?: UserRole | AuthUser): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === "string") return roleOrUser === "SUPER_ADMIN";
  return roleOrUser.role === "SUPER_ADMIN";
}

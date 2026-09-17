import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  isSuperAdmin,
  hashPassword,
  ROLE_DEFAULT_PERMISSIONS,
  ALL_PERMISSIONS,
  UserRole,
} from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Super Admin access required." },
      { status: 403 },
    );
  }

  const rawUsers = dbQuery(
    "SELECT id, name, email, role, isActive, permissions, assignedEvents, createdAt, updatedAt FROM users ORDER BY createdAt DESC",
  );

  const users = rawUsers.map((u) => {
    let parsedPermissions = [];
    try {
      if (u.permissions) {
        parsedPermissions =
          typeof u.permissions === "string"
            ? JSON.parse(u.permissions)
            : u.permissions;
      }
    } catch {}
    if (!parsedPermissions || parsedPermissions.length === 0) {
      parsedPermissions =
        ROLE_DEFAULT_PERMISSIONS[u.role as UserRole] ||
        ROLE_DEFAULT_PERMISSIONS.GATE_STAFF;
    }

    let parsedEvents = ["ALL"];
    try {
      if (u.assignedEvents) {
        parsedEvents =
          typeof u.assignedEvents === "string"
            ? JSON.parse(u.assignedEvents)
            : u.assignedEvents;
      }
    } catch {}

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: Number(u.isActive),
      permissions: parsedPermissions,
      assignedEvents: parsedEvents,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  });

  const events = dbQuery(
    "SELECT id, name, city, country, isCurrentEdition FROM events ORDER BY isCurrentEdition DESC, name ASC",
  );

  return NextResponse.json({
    users,
    events,
    availablePermissions: ALL_PERMISSIONS,
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Super Admin access required." },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, role, permissions, assignedEvents } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = dbQueryOne("SELECT id FROM users WHERE email = ?", [
      cleanEmail,
    ]);
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 },
      );
    }

    const userRole = (role as UserRole) || "GATE_STAFF";
    const userPermissions =
      permissions && Array.isArray(permissions) && permissions.length > 0
        ? permissions
        : ROLE_DEFAULT_PERMISSIONS[userRole] || ["scan"];

    const userEvents =
      assignedEvents &&
      Array.isArray(assignedEvents) &&
      assignedEvents.length > 0
        ? assignedEvents
        : ["ALL"];

    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = hashPassword(password);

    dbExecute(
      `INSERT INTO users (id, name, email, passwordHash, role, isActive, permissions, assignedEvents) 
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        name.trim(),
        cleanEmail,
        passwordHash,
        userRole,
        JSON.stringify(userPermissions),
        JSON.stringify(userEvents),
      ],
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Super Admin access required." },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      email,
      role,
      isActive,
      permissions,
      assignedEvents,
      password,
    } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "User ID, name, and email are required." },
        { status: 400 },
      );
    }

    const targetUser = dbQueryOne<any>("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    if (!targetUser) {
      return NextResponse.json(
        { error: "Staff account not found." },
        { status: 404 },
      );
    }

    // Safety: Prevent self-lockout
    if (targetUser.id === user.id) {
      if (isActive === 0 || isActive === false) {
        return NextResponse.json(
          { error: "You cannot deactivate your own administrative account." },
          { status: 400 },
        );
      }
      if (role && role !== "SUPER_ADMIN") {
        return NextResponse.json(
          {
            error: "You cannot demote your own account away from Super Admin.",
          },
          { status: 400 },
        );
      }
    }

    const cleanEmail = email.toLowerCase().trim();
    // Check duplicate email on another account
    const duplicate = dbQueryOne(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [cleanEmail, id],
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Another user already uses this email address." },
        { status: 409 },
      );
    }

    const newRole = (role as UserRole) || targetUser.role;
    const newIsActive = isActive === 0 || isActive === false ? 0 : 1;

    const userPermissions =
      permissions && Array.isArray(permissions)
        ? permissions
        : targetUser.permissions
          ? JSON.parse(targetUser.permissions)
          : ROLE_DEFAULT_PERMISSIONS[newRole];

    const userEvents =
      assignedEvents && Array.isArray(assignedEvents)
        ? assignedEvents
        : targetUser.assignedEvents
          ? JSON.parse(targetUser.assignedEvents)
          : ["ALL"];

    if (password && password.trim().length > 0) {
      const passwordHash = hashPassword(password.trim());
      dbExecute(
        `UPDATE users SET 
          name = ?, 
          email = ?, 
          passwordHash = ?, 
          role = ?, 
          isActive = ?, 
          permissions = ?, 
          assignedEvents = ?, 
          updatedAt = datetime('now') 
        WHERE id = ?`,
        [
          name.trim(),
          cleanEmail,
          passwordHash,
          newRole,
          newIsActive,
          JSON.stringify(userPermissions),
          JSON.stringify(userEvents),
          id,
        ],
      );
    } else {
      dbExecute(
        `UPDATE users SET 
          name = ?, 
          email = ?, 
          role = ?, 
          isActive = ?, 
          permissions = ?, 
          assignedEvents = ?, 
          updatedAt = datetime('now') 
        WHERE id = ?`,
        [
          name.trim(),
          cleanEmail,
          newRole,
          newIsActive,
          JSON.stringify(userPermissions),
          JSON.stringify(userEvents),
          id,
        ],
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Super Admin access required." },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 },
      );
    }

    if (id === user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own administrative account." },
        { status: 400 },
      );
    }

    // Safety: Ensure at least 1 other active Super Admin remains
    const superAdmins = dbQuery(
      "SELECT id FROM users WHERE role = 'SUPER_ADMIN' AND isActive = 1 AND id != ?",
      [id],
    );
    const targetUser = dbQueryOne<any>("SELECT role FROM users WHERE id = ?", [
      id,
    ]);

    if (targetUser?.role === "SUPER_ADMIN" && superAdmins.length === 0) {
      return NextResponse.json(
        {
          error: "Cannot delete the only remaining active Super Admin account.",
        },
        { status: 400 },
      );
    }

    dbExecute("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

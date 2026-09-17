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

  const rawUsers = await dbQuery<any>(
    `SELECT id, name, email, role,
            is_active AS "isActive",
            permissions,
            assigned_events AS "assignedEvents",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
     FROM users
     ORDER BY created_at ASC`,
  );

  const users = rawUsers.map((u: any) => {
    // JSONB comes back as array already — just guard against null/empty
    let parsedPermissions: string[] = Array.isArray(u.permissions)
      ? u.permissions
      : [];
    if (!parsedPermissions || parsedPermissions.length === 0) {
      parsedPermissions =
        ROLE_DEFAULT_PERMISSIONS[u.role as UserRole] ||
        ROLE_DEFAULT_PERMISSIONS.GATE_STAFF;
    }

    const parsedEvents: string[] = Array.isArray(u.assignedEvents)
      ? u.assignedEvents
      : ["ALL"];

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: Boolean(u.isActive),
      permissions: parsedPermissions,
      assignedEvents: parsedEvents,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  });

  const events = await dbQuery(
    `SELECT id, name, city, country, is_current_edition AS "isCurrentEdition"
     FROM events ORDER BY is_current_edition DESC, name ASC`,
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

    const existing = await dbQueryOne("SELECT id FROM users WHERE email = $1", [
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

    await dbExecute(
      `INSERT INTO users (id, name, email, password_hash, role, is_active, permissions, assigned_events)
       VALUES ($1, $2, $3, $4, $5, true, $6::jsonb, $7::jsonb)`,
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

    const targetUser = await dbQueryOne<any>(
      `SELECT id, role, is_active AS "isActive", permissions, assigned_events AS "assignedEvents"
       FROM users WHERE id = $1`,
      [id],
    );
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
    const duplicate = await dbQueryOne(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [cleanEmail, id],
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Another user already uses this email address." },
        { status: 409 },
      );
    }

    const newRole = (role as UserRole) || targetUser.role;
    const newIsActive = isActive === 0 || isActive === false ? false : true;

    const userPermissions =
      permissions && Array.isArray(permissions)
        ? permissions
        : Array.isArray(targetUser.permissions)
          ? targetUser.permissions
          : ROLE_DEFAULT_PERMISSIONS[newRole];

    const userEvents =
      assignedEvents && Array.isArray(assignedEvents)
        ? assignedEvents
        : Array.isArray(targetUser.assignedEvents)
          ? targetUser.assignedEvents
          : ["ALL"];

    if (password && password.trim().length > 0) {
      const passwordHash = hashPassword(password.trim());
      await dbExecute(
        `UPDATE users SET
          name = $1,
          email = $2,
          password_hash = $3,
          role = $4,
          is_active = $5,
          permissions = $6::jsonb,
          assigned_events = $7::jsonb,
          updated_at = NOW()
        WHERE id = $8`,
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
      await dbExecute(
        `UPDATE users SET
          name = $1,
          email = $2,
          role = $3,
          is_active = $4,
          permissions = $5::jsonb,
          assigned_events = $6::jsonb,
          updated_at = NOW()
        WHERE id = $7`,
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

    const superAdmins = await dbQuery(
      "SELECT id FROM users WHERE role = 'SUPER_ADMIN' AND is_active = true AND id != $1",
      [id],
    );
    const targetUser = await dbQueryOne<any>(
      "SELECT role FROM users WHERE id = $1",
      [id],
    );

    if (targetUser?.role === "SUPER_ADMIN" && superAdmins.length === 0) {
      return NextResponse.json(
        {
          error: "Cannot delete the only remaining active Super Admin account.",
        },
        { status: 400 },
      );
    }

    await dbExecute("DELETE FROM users WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

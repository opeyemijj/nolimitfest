import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  hasPermission,
  getUserAssignedEvents,
  canAccessEvent,
} from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "tickets"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eventId = req.nextUrl.searchParams.get("eventId");
  const assignedEvents = getUserAssignedEvents(user);

  let tiers;
  if (eventId) {
    if (!canAccessEvent(user, eventId)) {
      return NextResponse.json(
        { error: "Forbidden. Not assigned to this event." },
        { status: 403 },
      );
    }
    tiers = dbQuery(
      "SELECT * FROM ticket_tiers WHERE eventId = ? ORDER BY sortOrder ASC, price ASC",
      [eventId],
    );
  } else if (!assignedEvents.includes("ALL")) {
    tiers = dbQuery(
      `SELECT * FROM ticket_tiers WHERE eventId IN (${assignedEvents.map(() => "?").join(",")}) ORDER BY sortOrder ASC, price ASC`,
      assignedEvents,
    );
  } else {
    tiers = dbQuery(
      "SELECT * FROM ticket_tiers ORDER BY sortOrder ASC, price ASC",
    );
  }

  const parsed = tiers.map((t: any) => ({
    ...t,
    perks: typeof t.perks === "string" ? JSON.parse(t.perks) : t.perks || [],
    popular: Boolean(t.popular),
    isVVIP: Boolean(t.isVVIP),
  }));

  return NextResponse.json({ tiers: parsed });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "tickets")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      price,
      capacity,
      badge,
      description,
      perks,
      status,
      popular,
      isVVIP,
      paxPerUnit,
      color,
      wristbandColor,
    } = body;

    if (!id)
      return NextResponse.json({ error: "Tier ID required" }, { status: 400 });

    dbExecute(
      `UPDATE ticket_tiers SET 
        name = ?, price = ?, capacity = ?, badge = ?, description = ?, 
        perks = ?, status = ?, popular = ?, isVVIP = ?, paxPerUnit = ?,
        color = ?, wristbandColor = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [
        name,
        parseFloat(price),
        parseInt(capacity, 10),
        badge || "",
        description || "",
        JSON.stringify(perks || []),
        status || "active",
        popular ? 1 : 0,
        isVVIP ? 1 : 0,
        parseInt(paxPerUnit || 1, 10),
        color || "#00E676",
        wristbandColor || "NEON GREEN",
        id,
      ],
    );

    const updated = dbQueryOne("SELECT * FROM ticket_tiers WHERE id = ?", [id]);
    return NextResponse.json({ success: true, tier: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "tickets")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      eventId,
      name,
      category,
      price,
      capacity,
      badge,
      description,
      perks,
      status,
      paxPerUnit,
      isVVIP,
      popular,
      color,
      wristbandColor,
    } = body;

    const id = `tier-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    dbExecute(
      `INSERT INTO ticket_tiers (id, eventId, name, category, price, currency, capacity, soldCount, paxPerUnit, badge, description, perks, status, popular, isVVIP, sortOrder, color, wristbandColor)
       VALUES (?, ?, ?, ?, ?, 'AED', ?, 0, ?, ?, ?, ?, ?, ?, ?, 99, ?, ?)`,
      [
        id,
        eventId,
        name,
        category || "phase",
        parseFloat(price),
        parseInt(capacity, 10) || 100,
        parseInt(paxPerUnit, 10) || 1,
        badge || "",
        description || "",
        JSON.stringify(perks || []),
        status || "active",
        popular ? 1 : 0,
        isVVIP ? 1 : 0,
        color || "#00E676",
        wristbandColor || "NEON GREEN",
      ],
    );

    const created = dbQueryOne("SELECT * FROM ticket_tiers WHERE id = ?", [id]);
    return NextResponse.json({ success: true, tier: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

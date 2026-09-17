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

  const BASE_SELECT = `
    SELECT
      id,
      event_id             AS "eventId",
      name,
      category,
      price,
      currency,
      capacity,
      sold_count           AS "soldCount",
      pax_per_unit         AS "paxPerUnit",
      badge,
      description,
      perks,
      status,
      popular,
      is_vvip              AS "isVVIP",
      sort_order           AS "sortOrder",
      color,
      wristband_color      AS "wristbandColor",
      COALESCE(allow_deposit, true) AS "allowDeposit",
      COALESCE(deposit_percentage, 20) AS "depositPercentage",
      created_at           AS "createdAt",
      updated_at           AS "updatedAt"
    FROM ticket_tiers
  `;

  let tiers: any[];

  if (eventId) {
    if (!canAccessEvent(user, eventId)) {
      return NextResponse.json(
        { error: "Forbidden. Not assigned to this event." },
        { status: 403 },
      );
    }
    tiers = await dbQuery(
      `${BASE_SELECT} WHERE event_id = $1 ORDER BY sort_order ASC, price ASC`,
      [eventId],
    );
  } else if (!assignedEvents.includes("ALL")) {
    const placeholders = assignedEvents.map((_, i) => `$${i + 1}`).join(",");
    tiers = await dbQuery(
      `${BASE_SELECT} WHERE event_id IN (${placeholders}) ORDER BY sort_order ASC, price ASC`,
      assignedEvents,
    );
  } else {
    tiers = await dbQuery(`${BASE_SELECT} ORDER BY sort_order ASC, price ASC`);
  }

  const parsed = tiers.map((t: any) => ({
    ...t,
    perks: Array.isArray(t.perks) ? t.perks : [],
    popular: Boolean(t.popular),
    isVVIP: Boolean(t.isVVIP),
    allowDeposit: Boolean(t.allowDeposit),
    depositPercentage: Number(t.depositPercentage) || 20,
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
      allowDeposit,
      depositPercentage,
    } = body;

    if (!id)
      return NextResponse.json({ error: "Tier ID required" }, { status: 400 });

    let perksJson: string;
    if (Array.isArray(perks)) {
      perksJson = JSON.stringify(perks);
    } else if (typeof perks === "string") {
      try {
        const parsed = JSON.parse(perks);
        perksJson = JSON.stringify(Array.isArray(parsed) ? parsed : perks.split("\n").map((p: string) => p.trim()).filter(Boolean));
      } catch {
        perksJson = JSON.stringify(perks.split("\n").map((p: string) => p.trim()).filter(Boolean));
      }
    } else {
      perksJson = "[]";
    }

    await dbExecute(
      `UPDATE ticket_tiers SET
         name               = $1,
         price              = $2,
         capacity           = $3,
         badge              = $4,
         description        = $5,
         perks              = $6::jsonb,
         status             = $7,
         popular            = $8,
         is_vvip            = $9,
         pax_per_unit       = $10,
         color              = $11,
         wristband_color    = $12,
         allow_deposit      = $13,
         deposit_percentage = $14,
         updated_at         = NOW()
       WHERE id = $15`,
      [
        name,
        parseFloat(price),
        parseInt(capacity, 10),
        badge || "",
        description || "",
        perksJson,
        status || "active",
        Boolean(popular),
        Boolean(isVVIP),
        parseInt(paxPerUnit || 1, 10),
        color || "#00E676",
        wristbandColor || "NEON GREEN",
        allowDeposit !== undefined ? Boolean(allowDeposit) : true,
        depositPercentage !== undefined ? parseFloat(depositPercentage) : 20,
        id,
      ],
    );

    const updated = await dbQueryOne(
      `SELECT
         id,
         event_id             AS "eventId",
         name,
         category,
         price,
         currency,
         capacity,
         sold_count           AS "soldCount",
         pax_per_unit         AS "paxPerUnit",
         badge,
         description,
         perks,
         status,
         popular,
         is_vvip              AS "isVVIP",
         sort_order           AS "sortOrder",
         color,
         wristband_color      AS "wristbandColor",
         COALESCE(allow_deposit, true) AS "allowDeposit",
         COALESCE(deposit_percentage, 20) AS "depositPercentage",
         created_at           AS "createdAt",
         updated_at           AS "updatedAt"
       FROM ticket_tiers
       WHERE id = $1`,
      [id],
    );
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
      allowDeposit,
      depositPercentage,
    } = body;

    const id = `tier-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    let perksJson: string;
    if (Array.isArray(perks)) {
      perksJson = JSON.stringify(perks);
    } else if (typeof perks === "string") {
      try {
        const parsed = JSON.parse(perks);
        perksJson = JSON.stringify(Array.isArray(parsed) ? parsed : perks.split("\n").map((p: string) => p.trim()).filter(Boolean));
      } catch {
        perksJson = JSON.stringify(perks.split("\n").map((p: string) => p.trim()).filter(Boolean));
      }
    } else {
      perksJson = "[]";
    }

    await dbExecute(
      `INSERT INTO ticket_tiers
         (id, event_id, name, category, price, currency, capacity, sold_count,
          pax_per_unit, badge, description, perks, status, popular, is_vvip,
          sort_order, color, wristband_color, allow_deposit, deposit_percentage)
       VALUES
         ($1, $2, $3, $4, $5, 'AED', $6, 0,
          $7, $8, $9, $10::jsonb, $11, $12, $13,
          99, $14, $15, $16, $17)`,
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
        perksJson,
        status || "active",
        Boolean(popular),
        Boolean(isVVIP),
        color || "#00E676",
        wristbandColor || "NEON GREEN",
        allowDeposit !== undefined ? Boolean(allowDeposit) : true,
        depositPercentage !== undefined ? parseFloat(depositPercentage) : 20,
      ],
    );

    const created = await dbQueryOne(
      `SELECT
         id,
         event_id             AS "eventId",
         name,
         category,
         price,
         currency,
         capacity,
         sold_count           AS "soldCount",
         pax_per_unit         AS "paxPerUnit",
         badge,
         description,
         perks,
         status,
         popular,
         is_vvip              AS "isVVIP",
         sort_order           AS "sortOrder",
         color,
         wristband_color      AS "wristbandColor",
         COALESCE(allow_deposit, true) AS "allowDeposit",
         COALESCE(deposit_percentage, 20) AS "depositPercentage",
         created_at           AS "createdAt",
         updated_at           AS "updatedAt"
       FROM ticket_tiers
       WHERE id = $1`,
      [id],
    );
    return NextResponse.json({ success: true, tier: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

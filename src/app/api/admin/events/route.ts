import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  hasPermission,
  getUserAssignedEvents,
  canAccessEvent,
} from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "events"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignedEvents = getUserAssignedEvents(user);

  let events = await dbQuery<any>(
    `SELECT id, name, edition, city, country, status, dates, time, venue, address,
            tagline, description,
            hero_image AS "heroImage",
            expected_attendance AS "expectedAttendance",
            stages_count AS "stagesCount",
            is_current_edition AS "isCurrentEdition",
            year,
            created_at AS "createdAt"
     FROM events
     ORDER BY is_current_edition DESC, year ASC`,
  );

  if (!assignedEvents.includes("ALL")) {
    events = events.filter((e: any) => assignedEvents.includes(e.id));
  }

  return NextResponse.json({ events });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "events")) {
    return NextResponse.json(
      { error: "Forbidden. Events management permission required." },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      edition,
      city,
      country,
      status,
      dates,
      time,
      venue,
      address,
      tagline,
      description,
      heroImage,
      expectedAttendance,
      stagesCount,
      isCurrentEdition,
    } = body;

    if (!id)
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });

    if (!canAccessEvent(user, id)) {
      return NextResponse.json(
        {
          error:
            "Forbidden. You are not assigned to manage this festival edition.",
        },
        { status: 403 },
      );
    }

    if (isCurrentEdition) {
      // Reset all other events before promoting this one as the flagship
      await dbExecute("UPDATE events SET is_current_edition = false");
    }

    await dbExecute(
      `UPDATE events SET
        name                = $1,
        edition             = $2,
        city                = $3,
        country             = $4,
        status              = $5,
        dates               = $6,
        time                = $7,
        venue               = $8,
        address             = $9,
        tagline             = $10,
        description         = $11,
        hero_image          = $12,
        expected_attendance = $13,
        stages_count        = $14,
        is_current_edition  = $15,
        updated_at          = NOW()
       WHERE id = $16`,
      [
        name,
        edition,
        city,
        country,
        status,
        dates,
        time,
        venue,
        address,
        tagline,
        description,
        heroImage,
        expectedAttendance,
        stagesCount || 2,
        isCurrentEdition ? true : false,
        id,
      ],
    );

    const updated = await dbQueryOne<any>(
      `SELECT id, name, edition, city, country, status, dates, time, venue, address,
              tagline, description,
              hero_image AS "heroImage",
              expected_attendance AS "expectedAttendance",
              stages_count AS "stagesCount",
              is_current_edition AS "isCurrentEdition",
              year,
              created_at AS "createdAt"
       FROM events
       WHERE id = $1`,
      [id],
    );

    return NextResponse.json({ success: true, event: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

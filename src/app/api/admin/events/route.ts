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
  let events = dbQuery(
    "SELECT * FROM events ORDER BY isCurrentEdition DESC, year ASC",
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
      // If setting this event as flagship, reset others
      dbExecute("UPDATE events SET isCurrentEdition = 0");
    }

    dbExecute(
      `UPDATE events SET 
        name = ?, edition = ?, city = ?, country = ?, status = ?, dates = ?, time = ?, 
        venue = ?, address = ?, tagline = ?, description = ?, heroImage = ?, 
        expectedAttendance = ?, stagesCount = ?, isCurrentEdition = ?, updatedAt = datetime('now')
       WHERE id = ?`,
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
        isCurrentEdition ? 1 : 0,
        id,
      ],
    );

    const updated = dbQueryOne("SELECT * FROM events WHERE id = ?", [id]);
    return NextResponse.json({ success: true, event: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

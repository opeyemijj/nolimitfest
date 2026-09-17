import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "stages"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stages = await dbQuery(
    "SELECT * FROM stages ORDER BY id ASC",
  );

  // genres and production are JSONB — already parsed by pg driver
  return NextResponse.json({ stages });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "stages"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      id,
      name,
      subtitle,
      tagline,
      description,
      capacity,
      image,
      genres,
      production,
    } = body;

    await dbExecute(
      `UPDATE stages SET
        name        = $1,
        subtitle    = $2,
        tagline     = $3,
        description = $4,
        capacity    = $5,
        image       = $6,
        genres      = $7::jsonb,
        production  = $8::jsonb,
        updated_at  = NOW()
       WHERE id = $9`,
      [
        name,
        subtitle,
        tagline,
        description,
        capacity,
        image,
        JSON.stringify(Array.isArray(genres) ? genres : []),
        JSON.stringify(production || {}),
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

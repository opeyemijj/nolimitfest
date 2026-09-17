import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "stages"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stages = dbQuery("SELECT * FROM stages ORDER BY id ASC");
  return NextResponse.json({
    stages: stages.map((s: any) => ({
      ...s,
      genres:
        typeof s.genres === "string" ? JSON.parse(s.genres) : s.genres || [],
      production:
        typeof s.production === "string"
          ? JSON.parse(s.production)
          : s.production || {},
    })),
  });
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

    dbExecute(
      `UPDATE stages SET 
        name = ?, subtitle = ?, tagline = ?, description = ?, capacity = ?, 
        image = ?, genres = ?, production = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [
        name,
        subtitle,
        tagline,
        description,
        capacity,
        image,
        JSON.stringify(genres || []),
        JSON.stringify(production || {}),
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

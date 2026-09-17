import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "lineup"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artists = dbQuery("SELECT * FROM artists ORDER BY id ASC");
  return NextResponse.json({
    artists: artists.map((a: any) => ({
      ...a,
      hits: typeof a.hits === "string" ? JSON.parse(a.hits) : a.hits || [],
    })),
  });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "lineup"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      id,
      name,
      role,
      genre,
      day,
      stage,
      time,
      image,
      bio,
      origin,
      hits,
      spotifyUrl,
    } = body;

    dbExecute(
      `UPDATE artists SET 
        name = ?, role = ?, genre = ?, day = ?, stage = ?, time = ?, 
        image = ?, bio = ?, origin = ?, hits = ?, spotifyUrl = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [
        name,
        role,
        genre,
        day,
        stage,
        time,
        image,
        bio,
        origin,
        JSON.stringify(hits || []),
        spotifyUrl,
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "lineup"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      name,
      role,
      genre,
      day,
      stage,
      time,
      image,
      bio,
      origin,
      hits,
      spotifyUrl,
    } = body;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    dbExecute(
      `INSERT INTO artists (id, name, role, genre, day, stage, time, image, bio, origin, hits, spotifyUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        role || "Supporting Act",
        genre || "Afrobeats",
        day || "Day 1",
        stage || "Helipad Mainstage",
        time || "9:00 PM",
        image || "/images/artists/ruger.jpg",
        bio || "",
        origin || "Dubai, UAE",
        JSON.stringify(hits || []),
        spotifyUrl || "",
      ],
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

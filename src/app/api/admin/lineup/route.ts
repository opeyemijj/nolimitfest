import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "lineup"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artists = await dbQuery(
    `SELECT id, name, role, genre, day, stage, time, image, bio, origin,
            hits, spotify_url AS "spotifyUrl"
     FROM artists
     ORDER BY id ASC`,
  );

  // hits is JSONB — already parsed by pg driver
  return NextResponse.json({ artists });
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

    await dbExecute(
      `UPDATE artists SET
        name        = $1,
        role        = $2,
        genre       = $3,
        day         = $4,
        stage       = $5,
        time        = $6,
        image       = $7,
        bio         = $8,
        origin      = $9,
        hits        = $10::jsonb,
        spotify_url = $11,
        updated_at  = NOW()
       WHERE id = $12`,
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
        JSON.stringify(Array.isArray(hits) ? hits : []),
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

    await dbExecute(
      `INSERT INTO artists (id, name, role, genre, day, stage, time, image, bio, origin, hits, spotify_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)`,
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
        JSON.stringify(Array.isArray(hits) ? hits : []),
        spotifyUrl || "",
      ],
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

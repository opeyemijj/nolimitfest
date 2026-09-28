import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

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

  const safeArtists = (artists || []).map((a: any) => ({
    ...a,
    hits: Array.isArray(a.hits)
      ? a.hits
      : typeof a.hits === "string"
        ? (() => {
            try {
              return JSON.parse(a.hits);
            } catch {
              return [];
            }
          })()
        : [],
  }));

  return NextResponse.json({ artists: safeArtists });
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

    const parsedHits = Array.isArray(hits)
      ? hits
      : typeof hits === "string"
        ? hits.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

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
        JSON.stringify(parsedHits),
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

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 },
      );
    }

    let slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) slug = `artist-${Date.now()}`;

    // Prevent primary key collisions
    const existing = await dbQueryOne(`SELECT id FROM artists WHERE id = $1`, [slug]);
    const finalId = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const parsedHits = Array.isArray(hits)
      ? hits
      : typeof hits === "string"
        ? hits.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    await dbExecute(
      `INSERT INTO artists (id, name, role, genre, day, stage, time, image, bio, origin, hits, spotify_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)`,
      [
        finalId,
        name.trim(),
        role || "Supporting Act",
        genre || "Afrobeats",
        day || "Day 1",
        stage || "Helipad Mainstage",
        time || "9:00 PM",
        image || "/images/artists/ruger.jpg",
        bio || "",
        origin || "Dubai, UAE",
        JSON.stringify(parsedHits),
        spotifyUrl || "",
      ],
    );

    return NextResponse.json({ success: true, id: finalId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "lineup"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    let id = req.nextUrl.searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // body may be empty when using query param
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 },
      );
    }

    const artist = await dbQueryOne<{ id: string; name: string }>(
      `SELECT id, name FROM artists WHERE id = $1`,
      [id],
    );

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found in lineup" },
        { status: 404 },
      );
    }

    await dbExecute(`DELETE FROM artists WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: `Artist "${artist.name}" removed from lineup.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

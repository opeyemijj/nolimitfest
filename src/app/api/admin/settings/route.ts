import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "settings"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = dbQueryOne<any>(
    "SELECT * FROM site_config WHERE id = 'global'",
  );
  const faqs = dbQuery("SELECT * FROM faqs ORDER BY sortOrder ASC");

  return NextResponse.json({
    config: config
      ? {
          ...config,
          socials:
            typeof config.socials === "string"
              ? JSON.parse(config.socials)
              : config.socials,
          organizers:
            typeof config.organizers === "string"
              ? JSON.parse(config.organizers)
              : config.organizers,
        }
      : null,
    faqs,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "settings"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { config, faqs } = body;

    if (config) {
      dbExecute(
        `UPDATE site_config SET 
          name = ?, shortName = ?, tagline = ?, description = ?, 
          defaultWhatsApp = ?, email = ?, marqueeText = ?, ageLimit = ?, 
          socials = ?, organizers = ?, updatedAt = datetime('now')
         WHERE id = 'global'`,
        [
          config.name,
          config.shortName,
          config.tagline,
          config.description,
          config.defaultWhatsApp,
          config.email,
          config.marqueeText,
          config.ageLimit,
          JSON.stringify(config.socials || {}),
          JSON.stringify(config.organizers || []),
        ],
      );
    }

    if (Array.isArray(faqs)) {
      for (const faq of faqs) {
        if (faq.id) {
          dbExecute(
            `UPDATE faqs SET category = ?, question = ?, answer = ?, sortOrder = ?, updatedAt = datetime('now') WHERE id = ?`,
            [
              faq.category,
              faq.question,
              faq.answer,
              faq.sortOrder || 0,
              faq.id,
            ],
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

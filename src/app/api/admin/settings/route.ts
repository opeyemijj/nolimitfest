import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "settings"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await dbQueryOne<any>(
    `SELECT id, name, short_name AS "shortName", tagline, description,
            default_whatsapp AS "defaultWhatsApp", email,
            marquee_text AS "marqueeText", age_limit AS "ageLimit",
            socials, organizers
     FROM site_config
     WHERE id = 'global'`,
  );

  const faqs = await dbQuery(
    `SELECT id, category, question, answer, sort_order AS "sortOrder"
     FROM faqs
     ORDER BY sort_order ASC`,
  );

  return NextResponse.json({
    config: config ?? null,
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
      await dbExecute(
        `UPDATE site_config SET
          name           = $1,
          short_name     = $2,
          tagline        = $3,
          description    = $4,
          default_whatsapp = $5,
          email          = $6,
          marquee_text   = $7,
          age_limit      = $8,
          socials        = $9,
          organizers     = $10,
          updated_at     = NOW()
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
          config.socials || {},
          config.organizers || [],
        ],
      );
    }

    if (Array.isArray(faqs)) {
      for (const faq of faqs) {
        if (faq.id) {
          await dbExecute(
            `UPDATE faqs SET
              category   = $1,
              question   = $2,
              answer     = $3,
              sort_order = $4,
              updated_at = NOW()
             WHERE id = $5`,
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

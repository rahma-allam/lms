import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

async function ensureSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length === 0) {
    const [row] = await db.insert(settingsTable).values({}).returning();
    return row!;
  }
  return existing[0]!;
}

router.get("/", async (req, res) => {
  try {
    const settings = await ensureSettings();
    res.json({
      id: settings.id,
      academyName: settings.academyName,
      academyNameAr: settings.academyNameAr ?? null,
      logoUrl: settings.logoUrl ?? null,
      metaPixelId: settings.metaPixelId ?? null,
      googleTagId: settings.googleTagId ?? null,
      tiktokPixelId: settings.tiktokPixelId ?? null,
      defaultLanguage: settings.defaultLanguage,
      currency: settings.currency,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const parsed = UpdateSettingsBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { academyName, academyNameAr, logoUrl, metaPixelId, googleTagId, tiktokPixelId, defaultLanguage, currency } = parsed.data;

    const existing = await ensureSettings();

    const [settings] = await db
      .update(settingsTable)
      .set({
        academyName,
        academyNameAr: academyNameAr ?? null,
        logoUrl: logoUrl ?? null,
        metaPixelId: metaPixelId ?? null,
        googleTagId: googleTagId ?? null,
        tiktokPixelId: tiktokPixelId ?? null,
        defaultLanguage,
        currency,
      })
      .where(eq(settingsTable.id, existing.id))
      .returning();

    res.json({
      id: settings!.id,
      academyName: settings!.academyName,
      academyNameAr: settings!.academyNameAr ?? null,
      logoUrl: settings!.logoUrl ?? null,
      metaPixelId: settings!.metaPixelId ?? null,
      googleTagId: settings!.googleTagId ?? null,
      tiktokPixelId: settings!.tiktokPixelId ?? null,
      defaultLanguage: settings!.defaultLanguage,
      currency: settings!.currency,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, modulesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:moduleId/lessons", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId!);
    const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId)).orderBy(lessonsTable.order);
    res.json(lessons.map((l) => ({
      id: l.id,
      moduleId: l.moduleId,
      title: l.title,
      titleAr: l.titleAr ?? null,
      type: l.type,
      videoUrl: l.videoUrl ?? null,
      pdfUrl: l.pdfUrl ?? null,
      content: l.content ?? null,
      duration: l.duration ?? null,
      order: l.order,
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing lessons");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:moduleId/lessons", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId!);
    const { title, titleAr, type, videoUrl, pdfUrl, content, duration, order } = req.body;

    const [lesson] = await db
      .insert(lessonsTable)
      .values({ moduleId, title, titleAr: titleAr ?? null, type: type ?? "video", videoUrl: videoUrl ?? null, pdfUrl: pdfUrl ?? null, content: content ?? null, duration: duration ?? null, order: order ?? 0 })
      .returning();

    res.status(201).json({
      id: lesson!.id,
      moduleId: lesson!.moduleId,
      title: lesson!.title,
      titleAr: lesson!.titleAr ?? null,
      type: lesson!.type,
      videoUrl: lesson!.videoUrl ?? null,
      pdfUrl: lesson!.pdfUrl ?? null,
      content: lesson!.content ?? null,
      duration: lesson!.duration ?? null,
      order: lesson!.order,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating lesson");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { title, titleAr, type, videoUrl, pdfUrl, content, duration, order } = req.body;

    const [lesson] = await db
      .update(lessonsTable)
      .set({ title, titleAr: titleAr ?? null, type, videoUrl: videoUrl ?? null, pdfUrl: pdfUrl ?? null, content: content ?? null, duration: duration ?? null, order })
      .where(eq(lessonsTable.id, id))
      .returning();

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    res.json({
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      titleAr: lesson.titleAr ?? null,
      type: lesson.type,
      videoUrl: lesson.videoUrl ?? null,
      pdfUrl: lesson.pdfUrl ?? null,
      content: lesson.content ?? null,
      duration: lesson.duration ?? null,
      order: lesson.order,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating lesson");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting lesson");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

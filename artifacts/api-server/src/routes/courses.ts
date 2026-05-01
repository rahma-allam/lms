import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, modulesTable, lessonsTable, studentsTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCourseBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const courses = await db.select().from(coursesTable).orderBy(sql`${coursesTable.createdAt} desc`);

    const filtered = status ? courses.filter((c) => c.status === status) : courses;

    const enriched = await Promise.all(
      filtered.map(async (course) => {
        const [moduleCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(modulesTable)
          .where(eq(modulesTable.courseId, course.id));

        const [studentCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(studentsTable)
          .where(eq(studentsTable.courseId, course.id));

        return {
          id: course.id,
          title: course.title,
          titleAr: course.titleAr ?? null,
          description: course.description ?? null,
          price: Number(course.price),
          status: course.status,
          thumbnailUrl: course.thumbnailUrl ?? null,
          studentCount: studentCount?.count ?? 0,
          moduleCount: moduleCount?.count ?? 0,
          createdAt: course.createdAt.toISOString(),
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing courses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateCourseBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { title, titleAr, description, price, status, thumbnailUrl } = parsed.data;

    const [course] = await db
      .insert(coursesTable)
      .values({ title, titleAr: titleAr ?? null, description: description ?? null, price: String(price), status, thumbnailUrl: thumbnailUrl ?? null })
      .returning();

    await db.insert(activityTable).values({
      type: "course_created",
      description: `New course created: ${title}`,
      courseName: title,
    });

    res.status(201).json({
      id: course!.id,
      title: course!.title,
      titleAr: course!.titleAr ?? null,
      description: course!.description ?? null,
      price: Number(course!.price),
      status: course!.status,
      thumbnailUrl: course!.thumbnailUrl ?? null,
      studentCount: 0,
      moduleCount: 0,
      createdAt: course!.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));

    if (!course) return res.status(404).json({ error: "Course not found" });

    const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, id)).orderBy(modulesTable.order);

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, mod.id)).orderBy(lessonsTable.order);
        return {
          id: mod.id,
          courseId: mod.courseId,
          title: mod.title,
          titleAr: mod.titleAr ?? null,
          order: mod.order,
          lessonCount: lessons.length,
          lessons: lessons.map((l) => ({
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
          })),
        };
      })
    );

    const [studentCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentsTable)
      .where(eq(studentsTable.courseId, id));

    res.json({
      id: course.id,
      title: course.title,
      titleAr: course.titleAr ?? null,
      description: course.description ?? null,
      price: Number(course.price),
      status: course.status,
      thumbnailUrl: course.thumbnailUrl ?? null,
      studentCount: studentCount?.count ?? 0,
      moduleCount: modules.length,
      createdAt: course.createdAt.toISOString(),
      modules: modulesWithLessons,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const parsed = CreateCourseBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { title, titleAr, description, price, status, thumbnailUrl } = parsed.data;

    const [course] = await db
      .update(coursesTable)
      .set({ title, titleAr: titleAr ?? null, description: description ?? null, price: String(price), status, thumbnailUrl: thumbnailUrl ?? null })
      .where(eq(coursesTable.id, id))
      .returning();

    if (!course) return res.status(404).json({ error: "Course not found" });

    const [moduleCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(modulesTable)
      .where(eq(modulesTable.courseId, id));

    const [studentCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentsTable)
      .where(eq(studentsTable.courseId, id));

    res.json({
      id: course.id,
      title: course.title,
      titleAr: course.titleAr ?? null,
      description: course.description ?? null,
      price: Number(course.price),
      status: course.status,
      thumbnailUrl: course.thumbnailUrl ?? null,
      studentCount: studentCount?.count ?? 0,
      moduleCount: moduleCount?.count ?? 0,
      createdAt: course.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    await db.delete(coursesTable).where(eq(coursesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:courseId/modules", async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId!);
    const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId)).orderBy(modulesTable.order);

    const result = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, mod.id)).orderBy(lessonsTable.order);
        return {
          id: mod.id,
          courseId: mod.courseId,
          title: mod.title,
          titleAr: mod.titleAr ?? null,
          order: mod.order,
          lessonCount: lessons.length,
          lessons: lessons.map((l) => ({
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
          })),
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing modules");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:courseId/modules", async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId!);
    const { title, titleAr, order } = req.body;

    const [mod] = await db
      .insert(modulesTable)
      .values({ courseId, title, titleAr: titleAr ?? null, order: order ?? 0 })
      .returning();

    res.status(201).json({
      id: mod!.id,
      courseId: mod!.courseId,
      title: mod!.title,
      titleAr: mod!.titleAr ?? null,
      order: mod!.order,
      lessonCount: 0,
      lessons: [],
    });
  } catch (err) {
    req.log.error({ err }, "Error creating module");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

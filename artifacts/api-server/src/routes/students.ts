import { Router } from "express";
import { db } from "@workspace/db";
import { studentsTable, paymentsTable, coursesTable, activityTable } from "@workspace/db";
import { eq, sql, ilike, and } from "drizzle-orm";
import { CreateStudentBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { courseId, status, paymentStatus, search } = req.query;

    let students = await db
      .select({
        student: studentsTable,
        courseName: coursesTable.title,
      })
      .from(studentsTable)
      .leftJoin(coursesTable, eq(studentsTable.courseId, coursesTable.id))
      .orderBy(sql`${studentsTable.enrolledAt} desc`);

    if (courseId) students = students.filter((s) => s.student.courseId === parseInt(courseId as string));
    if (status) students = students.filter((s) => s.student.status === status);
    if (paymentStatus) students = students.filter((s) => s.student.paymentStatus === paymentStatus);
    if (search) {
      const q = (search as string).toLowerCase();
      students = students.filter(
        (s) => s.student.name.toLowerCase().includes(q) || s.student.email.toLowerCase().includes(q)
      );
    }

    res.json(
      students.map(({ student, courseName }) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone ?? null,
        status: student.status,
        courseId: student.courseId ?? null,
        courseName: courseName ?? null,
        paymentStatus: student.paymentStatus,
        progress: Number(student.progress),
        enrolledAt: student.enrolledAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing students");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { name, email, phone, courseId, status, paymentStatus } = parsed.data;

    const [student] = await db
      .insert(studentsTable)
      .values({ name, email, phone: phone ?? null, courseId: courseId ?? null, status, paymentStatus })
      .returning();

    let courseName: string | null = null;
    if (student!.courseId) {
      const [course] = await db.select({ title: coursesTable.title }).from(coursesTable).where(eq(coursesTable.id, student!.courseId));
      courseName = course?.title ?? null;
    }

    await db.insert(activityTable).values({
      type: "enrollment",
      description: `${name} enrolled${courseName ? ` in ${courseName}` : ""}`,
      studentName: name,
      courseName: courseName ?? undefined,
    });

    res.status(201).json({
      id: student!.id,
      name: student!.name,
      email: student!.email,
      phone: student!.phone ?? null,
      status: student!.status,
      courseId: student!.courseId ?? null,
      courseName,
      paymentStatus: student!.paymentStatus,
      progress: Number(student!.progress),
      enrolledAt: student!.enrolledAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating student");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);

    const [result] = await db
      .select({ student: studentsTable, courseName: coursesTable.title })
      .from(studentsTable)
      .leftJoin(coursesTable, eq(studentsTable.courseId, coursesTable.id))
      .where(eq(studentsTable.id, id));

    if (!result) return res.status(404).json({ error: "Student not found" });

    const payments = await db
      .select({ payment: paymentsTable, courseName: coursesTable.title })
      .from(paymentsTable)
      .leftJoin(coursesTable, eq(paymentsTable.courseId, coursesTable.id))
      .where(eq(paymentsTable.studentId, id))
      .orderBy(sql`${paymentsTable.createdAt} desc`);

    const { student, courseName } = result;

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone ?? null,
      status: student.status,
      courseId: student.courseId ?? null,
      courseName: courseName ?? null,
      paymentStatus: student.paymentStatus,
      progress: Number(student.progress),
      enrolledAt: student.enrolledAt.toISOString(),
      payments: payments.map(({ payment, courseName: cn }) => ({
        id: payment.id,
        studentId: payment.studentId,
        studentName: student.name,
        courseId: payment.courseId ?? null,
        courseName: cn ?? null,
        amount: Number(payment.amount),
        status: payment.status,
        method: payment.method,
        notes: payment.notes ?? null,
        paidAt: payment.paidAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching student");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const parsed = CreateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { name, email, phone, courseId, status, paymentStatus } = parsed.data;

    const [student] = await db
      .update(studentsTable)
      .set({ name, email, phone: phone ?? null, courseId: courseId ?? null, status, paymentStatus })
      .where(eq(studentsTable.id, id))
      .returning();

    if (!student) return res.status(404).json({ error: "Student not found" });

    let courseName: string | null = null;
    if (student.courseId) {
      const [course] = await db.select({ title: coursesTable.title }).from(coursesTable).where(eq(coursesTable.id, student.courseId));
      courseName = course?.title ?? null;
    }

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone ?? null,
      status: student.status,
      courseId: student.courseId ?? null,
      courseName,
      paymentStatus: student.paymentStatus,
      progress: Number(student.progress),
      enrolledAt: student.enrolledAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating student");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    await db.delete(studentsTable).where(eq(studentsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting student");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

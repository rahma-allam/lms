import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, studentsTable, coursesTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreatePaymentBody } from "@workspace/api-zod";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [stats] = await db
      .select({
        total: sql<number>`coalesce(sum(${paymentsTable.amount}::numeric) filter (where ${paymentsTable.status} = 'completed'), 0)`,
        pending: sql<number>`coalesce(sum(${paymentsTable.amount}::numeric) filter (where ${paymentsTable.status} = 'pending'), 0)`,
        thisMonth: sql<number>`coalesce(sum(${paymentsTable.amount}::numeric) filter (where ${paymentsTable.status} = 'completed' and ${paymentsTable.createdAt} >= ${startOfMonth}), 0)`,
        lastMonth: sql<number>`coalesce(sum(${paymentsTable.amount}::numeric) filter (where ${paymentsTable.status} = 'completed' and ${paymentsTable.createdAt} >= ${startOfLastMonth} and ${paymentsTable.createdAt} <= ${endOfLastMonth}), 0)`,
        totalCount: sql<number>`count(*)::int`,
        completedCount: sql<number>`count(*) filter (where ${paymentsTable.status} = 'completed')::int`,
        pendingCount: sql<number>`count(*) filter (where ${paymentsTable.status} = 'pending')::int`,
      })
      .from(paymentsTable);

    res.json({
      totalRevenue: Number(stats?.total ?? 0),
      pendingRevenue: Number(stats?.pending ?? 0),
      thisMonthRevenue: Number(stats?.thisMonth ?? 0),
      lastMonthRevenue: Number(stats?.lastMonth ?? 0),
      totalTransactions: stats?.totalCount ?? 0,
      completedTransactions: stats?.completedCount ?? 0,
      pendingTransactions: stats?.pendingCount ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching payment summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, studentId } = req.query;

    let payments = await db
      .select({
        payment: paymentsTable,
        studentName: studentsTable.name,
        courseName: coursesTable.title,
      })
      .from(paymentsTable)
      .leftJoin(studentsTable, eq(paymentsTable.studentId, studentsTable.id))
      .leftJoin(coursesTable, eq(paymentsTable.courseId, coursesTable.id))
      .orderBy(sql`${paymentsTable.createdAt} desc`);

    if (status) payments = payments.filter((p) => p.payment.status === status);
    if (studentId) payments = payments.filter((p) => p.payment.studentId === parseInt(studentId as string));

    res.json(
      payments.map(({ payment, studentName, courseName }) => ({
        id: payment.id,
        studentId: payment.studentId,
        studentName: studentName ?? null,
        courseId: payment.courseId ?? null,
        courseName: courseName ?? null,
        amount: Number(payment.amount),
        status: payment.status,
        method: payment.method,
        notes: payment.notes ?? null,
        paidAt: payment.paidAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing payments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreatePaymentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { studentId, courseId, amount, status, method, notes, paidAt } = parsed.data;

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        studentId,
        courseId: courseId ?? null,
        amount: String(amount),
        status,
        method,
        notes: notes ?? null,
        paidAt: paidAt ? new Date(paidAt as string) : null,
      })
      .returning();

    const [student] = await db.select({ name: studentsTable.name }).from(studentsTable).where(eq(studentsTable.id, studentId));
    let courseName: string | null = null;
    if (courseId) {
      const [course] = await db.select({ title: coursesTable.title }).from(coursesTable).where(eq(coursesTable.id, courseId));
      courseName = course?.title ?? null;
    }

    if (status === "completed") {
      await db.insert(activityTable).values({
        type: "payment",
        description: `Payment of $${amount} received from ${student?.name ?? "student"}`,
        studentName: student?.name ?? null,
        courseName: courseName ?? null,
        amount: String(amount),
      });

      if (student) {
        await db.update(studentsTable).set({ paymentStatus: "paid" }).where(eq(studentsTable.id, studentId));
      }
    }

    res.status(201).json({
      id: payment!.id,
      studentId: payment!.studentId,
      studentName: student?.name ?? null,
      courseId: payment!.courseId ?? null,
      courseName,
      amount: Number(payment!.amount),
      status: payment!.status,
      method: payment!.method,
      notes: payment!.notes ?? null,
      paidAt: payment!.paidAt?.toISOString() ?? null,
      createdAt: payment!.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const parsed = CreatePaymentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { studentId, courseId, amount, status, method, notes, paidAt } = parsed.data;

    const [payment] = await db
      .update(paymentsTable)
      .set({
        studentId,
        courseId: courseId ?? null,
        amount: String(amount),
        status,
        method,
        notes: notes ?? null,
        paidAt: paidAt ? new Date(paidAt as string) : null,
      })
      .where(eq(paymentsTable.id, id))
      .returning();

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const [student] = await db.select({ name: studentsTable.name }).from(studentsTable).where(eq(studentsTable.id, payment.studentId));
    let courseName: string | null = null;
    if (payment.courseId) {
      const [course] = await db.select({ title: coursesTable.title }).from(coursesTable).where(eq(coursesTable.id, payment.courseId));
      courseName = course?.title ?? null;
    }

    res.json({
      id: payment.id,
      studentId: payment.studentId,
      studentName: student?.name ?? null,
      courseId: payment.courseId ?? null,
      courseName,
      amount: Number(payment.amount),
      status: payment.status,
      method: payment.method,
      notes: payment.notes ?? null,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

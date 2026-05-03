import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, studentsTable, coursesTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreatePaymentBody } from "@workspace/api-zod";

const router = Router();

// 1. ملخص المدفوعات (Summary)
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

// 2. قائمة المدفوعات (بما في ذلك رابط الصورة للداشبورد)
router.get("/", async (req, res) => {
  try {
    const { status, studentId } = req.query;

    let query = db
      .select({
        payment: paymentsTable,
        studentName: studentsTable.name,
        courseName: coursesTable.title,
      })
      .from(paymentsTable)
      .leftJoin(studentsTable, eq(paymentsTable.studentId, studentsTable.id))
      .leftJoin(coursesTable, eq(paymentsTable.courseId, coursesTable.id))
      .orderBy(sql`${paymentsTable.createdAt} desc`);

    let payments = await query;

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
        receiptUrl: payment.receiptUrl ?? null, // أضفنا هذا الحقل ليظهر في الداشبورد
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

// 3. إنشاء عملية دفع جديدة (من صفحة الـ Checkout)
router.post("/", async (req, res) => {
  try {
    // ملاحظة: تأكدي من تحديث CreatePaymentBody في ملف الـ zod ليشمل receiptUrl
    const parsed = CreatePaymentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { studentId, courseId, amount, status, method, notes, paidAt, receiptUrl } = parsed.data as any;

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        studentId,
        courseId: courseId ?? null,
        amount: String(amount),
        status: status || "pending",
        method,
        receiptUrl: receiptUrl ?? null, // حفظ رابط الصورة هنا
        notes: notes ?? null,
        paidAt: paidAt ? new Date(paidAt as string) : null,
      })
      .returning();

    const [student] = await db.select({ name: studentsTable.name }).from(studentsTable).where(eq(studentsTable.id, studentId));
    
    // إذا تم الدفع بنجاح فوراً (مثلاً بطاقة ائتمانية)
    if (status === "completed") {
      await db.update(studentsTable).set({ paymentStatus: "paid" }).where(eq(studentsTable.id, studentId));
      
      await db.insert(activityTable).values({
        type: "payment",
        description: `Payment of $${amount} received from ${student?.name ?? "student"}`,
        studentName: student?.name ?? null,
        amount: String(amount),
      });
    }

    res.status(201).json({
      ...payment,
      amount: Number(payment.amount),
      studentName: student?.name ?? null
    });
  } catch (err) {
    req.log.error({ err }, "Error creating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. تحديث حالة الدفع (تستخدم من قبل الأدمن لقبول الطلب بعد رؤية الصورة)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const parsed = CreatePaymentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { studentId, courseId, amount, status, method, notes, paidAt, receiptUrl } = parsed.data as any;

    const [payment] = await db
      .update(paymentsTable)
      .set({
        studentId,
        courseId: courseId ?? null,
        amount: String(amount),
        status,
        method,
        receiptUrl: receiptUrl ?? null,
        notes: notes ?? null,
        paidAt: paidAt ? new Date(paidAt as string) : null,
      })
      .where(eq(paymentsTable.id, id))
      .returning();

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // لو الأدمن وافق على الطلب (Completed)
    if (status === "completed") {
      // 1. تحديث حالة الطالب لـ "Paid"
      await db.update(studentsTable)
        .set({ paymentStatus: "paid" })
        .where(eq(studentsTable.id, payment.studentId));

      // 2. تسجيل النشاط
      const [student] = await db.select({ name: studentsTable.name }).from(studentsTable).where(eq(studentsTable.id, payment.studentId));
      await db.insert(activityTable).values({
        type: "payment",
        description: `Admin confirmed payment of $${amount} for ${student?.name}`,
        studentName: student?.name ?? null,
        amount: String(amount),
      });
    }

    res.json({
      ...payment,
      amount: Number(payment.amount)
    });
  } catch (err) {
    req.log.error({ err }, "Error updating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
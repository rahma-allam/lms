import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import studentsRouter from "./students";
import paymentsRouter from "./payments";
import settingsRouter from "./settings";
import instructorsRouter from "./instructors";
const router: IRouter = Router();

router.use(healthRouter);
router.use("/dashboard", dashboardRouter);
router.use("/instructors", instructorsRouter);
router.use("/courses", coursesRouter);
router.use("/modules", lessonsRouter);
router.use("/lessons", lessonsRouter);   
router.use("/students", studentsRouter);
router.use("/payments", paymentsRouter);
router.use("/settings", settingsRouter);

export default router;

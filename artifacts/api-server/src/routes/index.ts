import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import childrenRouter from "./children";
import prayersRouter from "./prayers";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(childrenRouter);
router.use(prayersRouter);
router.use(statsRouter);
router.use(leaderboardRouter);

export default router;

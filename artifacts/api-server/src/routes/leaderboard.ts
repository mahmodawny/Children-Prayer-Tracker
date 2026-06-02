import { Router } from "express";
import { db } from "@workspace/db";
import { prayerRecordsTable, usersTable, achievementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/leaderboard", authMiddleware, async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  const period = (parsed.success && parsed.data.period) ? parsed.data.period : "weekly";

  const now = new Date();
  let fromDate = "";
  if (period === "daily") fromDate = now.toISOString().slice(0, 10);
  else if (period === "weekly") fromDate = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  else if (period === "monthly") fromDate = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);

  const children = await db.select().from(usersTable).where(eq(usersTable.role, "child"));
  const allRecords = await db.select().from(prayerRecordsTable);

  const childStats = children.map(child => {
    const records = period === "all"
      ? allRecords.filter(r => r.userId === child.id)
      : allRecords.filter(r => r.userId === child.id && r.date >= fromDate);
    const prayers = records.length;
    const daysInPeriod = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
    const compliance = Math.round((prayers / (daysInPeriod * 5)) * 100);
    return { child, prayers, compliance, points: child.points };
  });

  childStats.sort((a, b) => b.points - a.points || b.prayers - a.prayers);

  res.json(childStats.map((s, i) => ({
    rank: i + 1,
    userId: s.child.id,
    name: s.child.name,
    username: s.child.username,
    points: s.points,
    prayers: s.prayers,
    compliance: s.compliance,
  })));
});

router.get("/achievements/me", authMiddleware, async (req, res) => {
  const achievements = await db.select().from(achievementsTable)
    .where(eq(achievementsTable.userId, req.user!.id));
  res.json(achievements);
});

router.get("/achievements/child/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const achievements = await db.select().from(achievementsTable).where(eq(achievementsTable.userId, id));
  res.json(achievements);
});

export default router;

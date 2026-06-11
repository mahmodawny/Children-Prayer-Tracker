import { Router } from "express";
import { db } from "@workspace/db";
import { prayerRecordsTable, usersTable, achievementsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/leaderboard", adminMiddleware, async (req, res) => {
  const now = new Date();
  const yearParam = parseInt(req.query.year as string) || now.getFullYear();
  const monthParam = parseInt(req.query.month as string) || (now.getMonth() + 1);

  const fromDate = `${yearParam}-${String(monthParam).padStart(2, "0")}-01`;
  const lastDay = new Date(yearParam, monthParam, 0).getDate();
  const toDate = `${yearParam}-${String(monthParam).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const children = await db.select().from(usersTable).where(eq(usersTable.role, "child"));
  const monthRecords = await db.select().from(prayerRecordsTable).where(
    and(
      sql`${prayerRecordsTable.date} >= ${fromDate}`,
      sql`${prayerRecordsTable.date} <= ${toDate}`
    )
  );

  const childStats = children.map(child => {
    const records = monthRecords.filter(r => r.userId === child.id);
    const prayers = records.length;
    const compliance = Math.round((prayers / (lastDay * 5)) * 100);
    return { child, prayers, compliance };
  });

  childStats.sort((a, b) => b.prayers - a.prayers || a.child.name.localeCompare(b.child.name));

  res.json(childStats.map((s, i) => ({
    rank: i + 1,
    userId: s.child.id,
    name: s.child.name,
    username: s.child.username,
    prayers: s.prayers,
    compliance: s.compliance,
    points: s.child.points,
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

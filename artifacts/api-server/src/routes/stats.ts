import { Router } from "express";
import { db } from "@workspace/db";
import { prayerRecordsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = Router();

async function computeStats(userId: number) {
  const records = await db.select().from(prayerRecordsTable).where(eq(prayerRecordsTable.userId, userId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const todayRecords = records.filter((r) => r.date === today);
  const weekRecords = records.filter((r) => r.date >= weekAgo);
  const monthRecords = records.filter((r) => r.date >= monthAgo);

  const todayCount = todayRecords.length;
  const weekCount = weekRecords.length;
  const monthCount = monthRecords.length;

  const createdAtStr = user?.createdAt ?? now.toISOString();
  const daysRegistered = Math.max(1, Math.ceil((now.getTime() - new Date(createdAtStr).getTime()) / 86400000));
  const daysSince = Math.min(daysRegistered, 30);

  const dailyCompliance = Math.round((todayCount / 5) * 100);
  const weeklyCompliance = Math.round((weekCount / (Math.min(7, daysRegistered) * 5)) * 100);
  const monthlyCompliance = Math.round((monthCount / (daysSince * 5)) * 100);

  const datesSorted = [...new Set(records.map((r) => r.date))].sort().reverse();
  let streak = 0;
  const msPerDay = 86400000;
  for (let i = 0; i < datesSorted.length; i++) {
    const dateMs = new Date(datesSorted[i]).getTime();
    const expectedMs = now.getTime() - i * msPerDay;
    const expectedDate = new Date(expectedMs).toISOString().slice(0, 10);
    if (datesSorted[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalPrayers: records.length,
    dailyCompliance,
    weeklyCompliance,
    monthlyCompliance,
    currentStreak: streak,
    points: user?.points ?? 0,
    todayCount,
    weekCount,
    monthCount,
  };
}

router.get("/stats/me", authMiddleware, async (req, res) => {
  const stats = await computeStats(req.user!.id);
  res.json(stats);
});

router.get("/stats/child/:id", adminMiddleware, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const stats = await computeStats(id);
  res.json(stats);
});

router.get("/stats/admin/overview", adminMiddleware, async (req, res) => {
  const children = await db.select().from(usersTable).where(eq(usersTable.role, "child"));
  const totalChildren = children.length;

  if (totalChildren === 0) {
    res.json({ totalChildren: 0, totalPrayers: 0, averageCompliance: 0, topChild: null, todayPrayers: 0 });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const allRecords = await db.select().from(prayerRecordsTable);
  const totalPrayers = allRecords.length;
  const todayPrayers = allRecords.filter((r) => r.date === today).length;

  let topChild: string | null = null;
  let topPoints = -1;
  for (const c of children) {
    if (c.points > topPoints) { topPoints = c.points; topChild = c.name; }
  }

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthRecords = allRecords.filter((r) => r.date >= monthAgo);
  const totalPossible = totalChildren * 30 * 5;
  const averageCompliance = totalPossible > 0 ? Math.round((monthRecords.length / totalPossible) * 100) : 0;

  res.json({ totalChildren, totalPrayers, averageCompliance, topChild, todayPrayers });
});

export default router;

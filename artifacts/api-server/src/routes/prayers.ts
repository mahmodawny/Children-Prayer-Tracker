import { Router } from "express";
import { db } from "@workspace/db";
import { prayerRecordsTable, usersTable, achievementsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { RecordPrayerBody, GetPrayerHistoryQueryParams, GetPrayerTimesQueryParams } from "@workspace/api-zod";

const router = Router();

const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

async function fetchPrayerTimes(city: string, country: string, date: string) {
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`;
    const res = await fetch(url);
    const data = await res.json() as { code: number; data: { timings: Record<string, string> } };
    if (data.code === 200) {
      return {
        fajr: data.data.timings.Fajr,
        dhuhr: data.data.timings.Dhuhr,
        asr: data.data.timings.Asr,
        maghrib: data.data.timings.Maghrib,
        isha: data.data.timings.Isha,
      };
    }
  } catch {}
  return getDefaultPrayerTimes();
}

function getDefaultPrayerTimes() {
  return { fajr: "05:00", dhuhr: "12:30", asr: "15:45", maghrib: "18:30", isha: "20:00" };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getPrayerWindowEnd(times: Record<string, string>, prayerName: string): number {
  const order = PRAYER_NAMES;
  const idx = order.indexOf(prayerName as typeof order[number]);
  if (idx < order.length - 1) {
    return timeToMinutes(times[order[idx + 1]]);
  }
  return 24 * 60;
}

router.get("/prayers/today", authMiddleware, async (req, res) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const city = user?.city ?? "Mecca";
  const country = user?.country ?? "Saudi Arabia";

  const times = await fetchPrayerTimes(city, country, today);

  const recorded = await db.select().from(prayerRecordsTable)
    .where(and(eq(prayerRecordsTable.userId, userId), eq(prayerRecordsTable.date, today)));
  const recordedSet = new Set(recorded.map(r => r.prayerName));

  const prayers = PRAYER_NAMES.map(name => {
    const prayerStart = timeToMinutes(times[name]);
    const prayerEnd = getPrayerWindowEnd(times, name);
    const isCurrentOrPast = currentMinutes >= prayerStart;
    const hasPassed = currentMinutes >= prayerEnd;
    const isRecorded = recordedSet.has(name);

    return {
      name,
      nameAr: PRAYER_NAMES_AR[name],
      time: times[name],
      canRecord: isCurrentOrPast && !hasPassed && !isRecorded,
      recorded: isRecorded,
      passed: hasPassed && !isRecorded,
    };
  });

  res.json({
    date: today,
    prayers,
    recordedCount: recordedSet.size,
    totalCount: 5,
  });
});

router.post("/prayers/record", authMiddleware, async (req, res) => {
  const parsed = RecordPrayerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { prayerName, date } = parsed.data;
  const userId = req.user!.id;
  const today = new Date().toISOString().slice(0, 10);

  if (date !== today) { res.status(400).json({ error: "Can only record today's prayers" }); return; }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const city = user?.city ?? "Mecca";
  const country = user?.country ?? "Saudi Arabia";
  const times = await fetchPrayerTimes(city, country, today);

  const prayerStart = timeToMinutes(times[prayerName]);
  const prayerEnd = getPrayerWindowEnd(times, prayerName);

  if (currentMinutes < prayerStart) {
    res.status(400).json({ error: "Prayer time has not started yet" });
    return;
  }
  if (currentMinutes >= prayerEnd) {
    res.status(400).json({ error: "Prayer time has passed" });
    return;
  }

  const existingRecords = await db.select().from(prayerRecordsTable)
    .where(and(eq(prayerRecordsTable.userId, userId), eq(prayerRecordsTable.prayerName, prayerName), eq(prayerRecordsTable.date, date)));
  if (existingRecords.length > 0) { res.status(409).json({ error: "Prayer already recorded" }); return; }

  const performedAt = now.toISOString();
  const [record] = await db.insert(prayerRecordsTable).values({
    userId, prayerName, date, performedAt,
  }).returning();

  await db.update(usersTable).set({ points: sql`${usersTable.points} + 1` }).where(eq(usersTable.id, userId));

  await checkAndAwardAchievements(userId, prayerName);

  res.status(201).json(record);
});

async function checkAndAwardAchievements(userId: number, prayerName: string) {
  const records = await db.select().from(prayerRecordsTable).where(eq(prayerRecordsTable.userId, userId));
  const existingAchievements = await db.select().from(achievementsTable).where(eq(achievementsTable.userId, userId));
  const existingTypes = new Set(existingAchievements.map(a => a.type));
  const now = new Date().toISOString();

  if (!existingTypes.has("first_prayer") && records.length === 1) {
    await db.insert(achievementsTable).values({
      userId, type: "first_prayer",
      title: "First Prayer", titleAr: "أول صلاة",
      description: "Recorded your first prayer!", descriptionAr: "سجلت أول صلاة لك!",
      icon: "🌟", earnedAt: now,
    });
  }

  if (!existingTypes.has("fajr_hero") && prayerName === "fajr") {
    const fajrCount = records.filter(r => r.prayerName === "fajr").length;
    if (fajrCount >= 7) {
      await db.insert(achievementsTable).values({
        userId, type: "fajr_hero",
        title: "Fajr Hero", titleAr: "بطل الفجر",
        description: "Prayed Fajr 7 days in a row!", descriptionAr: "صليت الفجر 7 أيام متتالية!",
        icon: "🌅", earnedAt: now,
      });
    }
  }

  if (!existingTypes.has("consistent_praying") && records.length >= 25) {
    await db.insert(achievementsTable).values({
      userId, type: "consistent_praying",
      title: "Consistent Praying", titleAr: "محافظ على الصلاة",
      description: "Recorded 25 prayers!", descriptionAr: "سجلت 25 صلاة!",
      icon: "🕌", earnedAt: now,
    });
  }

  if (!existingTypes.has("full_week")) {
    const last7 = [...new Set(records.map(r => r.date))].sort().reverse().slice(0, 7);
    if (last7.length >= 7) {
      const prayersPerDay = last7.map(d => records.filter(r => r.date === d).length);
      if (prayersPerDay.every(c => c >= 5)) {
        await db.insert(achievementsTable).values({
          userId, type: "full_week",
          title: "Full Week", titleAr: "أسبوع كامل دون انقطاع",
          description: "Prayed all 5 prayers every day for a week!", descriptionAr: "صليت الصلوات الخمس كل يوم لأسبوع كامل!",
          icon: "🏆", earnedAt: now,
        });
      }
    }
  }

  if (!existingTypes.has("century") && records.length >= 100) {
    await db.insert(achievementsTable).values({
      userId, type: "century",
      title: "Prayer Champion", titleAr: "بطل الصلاة",
      description: "Recorded 100 prayers!", descriptionAr: "سجلت 100 صلاة!",
      icon: "🎯", earnedAt: now,
    });
  }
}

router.get("/prayers/history", authMiddleware, async (req, res) => {
  const parsed = GetPrayerHistoryQueryParams.safeParse(req.query);
  const days = parsed.success ? (parsed.data.days ?? 30) : 30;
  const userId = req.user!.id;

  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const records = await db.select().from(prayerRecordsTable)
    .where(and(eq(prayerRecordsTable.userId, userId), sql`${prayerRecordsTable.date} >= ${fromDate}`));

  const byDate: Record<string, string[]> = {};
  for (const r of records) {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r.prayerName);
  }

  const result = Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, prayers]) => ({ date, prayers }));

  res.json(result);
});

router.get("/prayers/times", async (req, res) => {
  const parsed = GetPrayerTimesQueryParams.safeParse(req.query);
  const city = (parsed.success && parsed.data.city) ? parsed.data.city : "Mecca";
  const country = (parsed.success && parsed.data.country) ? parsed.data.country : "Saudi Arabia";
  const today = new Date().toISOString().slice(0, 10);
  const times = await fetchPrayerTimes(city, country, today);
  res.json({ ...times, date: today, city, country });
});

export default router;

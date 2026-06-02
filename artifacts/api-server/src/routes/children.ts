import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, prayerRecordsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { adminMiddleware } from "../middlewares/auth";
import { ListChildrenQueryParams, CreateChildBody, UpdateChildBody } from "@workspace/api-zod";

const router = Router();

router.get("/children", adminMiddleware, async (req, res) => {
  const parsed = ListChildrenQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { search, sortBy } = params;

  const allChildren = await db.select().from(usersTable).where(eq(usersTable.role, "child"));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const childData = await Promise.all(
    allChildren.map(async (child) => {
      const records = await db.select().from(prayerRecordsTable)
        .where(and(eq(prayerRecordsTable.userId, child.id), sql`${prayerRecordsTable.date} >= ${thirtyDaysAgo}`));
      const totalPrayers = records.length;
      const daysActive = Math.min(30, Math.max(1, Math.ceil((Date.now() - new Date(child.createdAt).getTime()) / 86400000)));
      const maxPossible = daysActive * 5;
      const compliance = maxPossible > 0 ? Math.round((totalPrayers / maxPossible) * 100) : 0;
      return { ...child, totalPrayers, compliance };
    })
  );

  let filtered = childData;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q));
  }

  if (sortBy === "prayers") {
    filtered.sort((a, b) => b.totalPrayers - a.totalPrayers);
  } else if (sortBy === "compliance") {
    filtered.sort((a, b) => b.compliance - a.compliance);
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json(filtered.map((c, i) => ({
    id: c.id,
    name: c.name,
    username: c.username,
    totalPrayers: c.totalPrayers,
    compliance: c.compliance,
    points: c.points,
    rank: i + 1,
  })));
});

router.post("/children", adminMiddleware, async (req, res) => {
  const parsed = CreateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { username, password, name, city, country } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Username already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const [inserted] = await db.insert(usersTable).values({
    username, passwordHash, name, role: "child",
    city: city ?? null, country: country ?? null, createdAt: now,
  }).returning();

  res.status(201).json({
    id: inserted.id, username: inserted.username, name: inserted.name,
    role: inserted.role, points: inserted.points, city: inserted.city,
    country: inserted.country, createdAt: inserted.createdAt,
  });
});

router.get("/children/:id", adminMiddleware, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [child] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!child || child.role !== "child") { res.status(404).json({ error: "Not found" }); return; }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const records = await db.select().from(prayerRecordsTable)
    .where(and(eq(prayerRecordsTable.userId, id), sql`${prayerRecordsTable.date} >= ${thirtyDaysAgo}`));
  const totalPrayers = records.length;
  const daysActive = Math.min(30, Math.max(1, Math.ceil((Date.now() - new Date(child.createdAt).getTime()) / 86400000)));
  const compliance = Math.round((totalPrayers / (daysActive * 5)) * 100);

  res.json({
    id: child.id, name: child.name, username: child.username,
    totalPrayers, compliance, points: child.points,
    city: child.city, country: child.country, createdAt: child.createdAt,
  });
});

router.patch("/children/:id", adminMiddleware, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdateChildBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  const { username, password, name, city, country } = parsed.data;
  if (username) updates.username = username;
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  if (name) updates.name = name;
  if (city !== undefined) updates.city = city;
  if (country !== undefined) updates.country = country;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    id: updated.id, username: updated.username, name: updated.name,
    role: updated.role, points: updated.points, city: updated.city,
    country: updated.country, createdAt: updated.createdAt,
  });
});

router.delete("/children/:id", adminMiddleware, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).end();
});

export default router;

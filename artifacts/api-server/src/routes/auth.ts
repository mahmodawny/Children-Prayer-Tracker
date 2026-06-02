import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, signToken } from "../middlewares/auth";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { username, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role as "child" | "admin" });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      points: user.points,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { username, password, name, city, country } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing) {
    res.status(409).json({ error: "Username already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const [inserted] = await db.insert(usersTable).values({
    username,
    passwordHash,
    name,
    role: "child",
    city: city ?? null,
    country: country ?? null,
    createdAt: now,
  }).returning();

  const token = signToken({ id: inserted.id, username: inserted.username, role: "child" });
  res.status(201).json({
    token,
    user: {
      id: inserted.id,
      username: inserted.username,
      name: inserted.name,
      role: inserted.role,
      points: inserted.points,
      city: inserted.city,
      country: inserted.country,
      createdAt: inserted.createdAt,
    },
  });
});

router.get("/auth/me", authMiddleware, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    points: user.points,
    city: user.city,
    country: user.country,
    createdAt: user.createdAt,
  });
});

export default router;

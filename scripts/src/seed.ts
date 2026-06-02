import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  // Admin
  const existing = await db.select().from(usersTable).where(eq(usersTable.username, "admin")).get();
  if (!existing) {
    const hash = await bcrypt.hash("admin123", 10);
    await db.insert(usersTable).values({
      username: "admin", passwordHash: hash, name: "المدير",
      role: "admin", city: "Mecca", country: "Saudi Arabia",
      createdAt: new Date().toISOString(),
    });
    console.log("Admin created: admin / admin123");
  } else {
    console.log("Admin already exists");
  }

  const children = [
    { username: "ahmed", name: "أحمد محمد", city: "Riyadh", country: "Saudi Arabia" },
    { username: "sara", name: "سارة علي", city: "Jeddah", country: "Saudi Arabia" },
    { username: "omar", name: "عمر حسن", city: "Cairo", country: "Egypt" },
  ];

  for (const c of children) {
    const ex = await db.select().from(usersTable).where(eq(usersTable.username, c.username)).get();
    if (!ex) {
      const hash = await bcrypt.hash("child123", 10);
      await db.insert(usersTable).values({
        username: c.username, passwordHash: hash, name: c.name,
        role: "child", city: c.city, country: c.country,
        createdAt: new Date().toISOString(),
      });
      console.log("Created:", c.username, "/ child123");
    }
  }
  console.log("Seeding done!");
}

seed().catch(console.error);

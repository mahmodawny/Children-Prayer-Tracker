import { defineConfig } from "drizzle-kit";
import path from "path";

// DB lives next to the api-server where it runs (cwd = artifacts/api-server)
const DB_PATH = process.env.DATABASE_PATH ?? path.join(__dirname, "..", "..", "artifacts", "api-server", "prayer_tracker.db");

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});

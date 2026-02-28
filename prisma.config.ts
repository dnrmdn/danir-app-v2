import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Standard process.env won't crash if the variable is missing
    url: process.env.DATABASE_URL || "postgres://localhost:5432/placeholder",
  },
});
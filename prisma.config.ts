import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // MUST exist for prisma migrate dev
    url: env("DATABASE_URL"), // or env("DATABASE_URL") if you want
  },
});

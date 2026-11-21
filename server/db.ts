import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

let db: any;

if (databaseUrl) {
  try {
    const pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool, { schema });
  } catch {
    console.warn("[AI Studio] Database connection failed — using in-memory mock");
  }
}

if (!db) {
  console.warn("WARNING: DATABASE_URL environment variable is not set. Using in-memory database mock.");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === "query" ? new Proxy({}, { get: () => noOp }) : async () => [],
    }
  );
}

export { db };

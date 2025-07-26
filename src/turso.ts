import { createClient } from "@libsql/client";

const tursoUrl = Deno.env.get("TURSO_URL");
const tursoAuthToken = Deno.env.get("TURSO_AUTH_TOKEN");

if (!tursoUrl) {
  throw new Error("TURSO_URL environment variable is not set");
}

if (!tursoAuthToken) {
  throw new Error("TURSO_AUTH_TOKEN environment variable is not set");
}

export const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

export async function createEventsTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      meta TEXT NOT NULL
    )
  `);
}

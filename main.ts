import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "./src/auth.ts";
import { db } from "./src/db.ts";
import { EventsArraySchema, LogsArraySchema } from "./src/validation.ts";

export const app = new Hono();


app.post(
  "/events",
  authMiddleware,
  zValidator("json", EventsArraySchema),
  async (c) => {
    const events = c.req.valid("json");

    try {
      await db.insertInto("events").values(events).execute();
      return c.json({ success: true, count: events.length });
    } catch (error) {
      return c.json({ error: "Failed to insert events" }, 500);
    }
  }
);

app.post(
  "/logs",
  authMiddleware,
  zValidator("json", LogsArraySchema),
  async (c) => {
    const logs = c.req.valid("json");

    try {
      await db.insertInto("logs").values(logs).execute();
      return c.json({ success: true, count: logs.length });
    } catch (error) {
      return c.json({ error: "Failed to insert logs" }, 500);
    }
  }
);

if (import.meta.main) {
  Deno.serve(app.fetch);
}

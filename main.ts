import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  publicKeyAuthMiddleware,
  privateKeyAuthMiddleware,
} from "./src/auth.ts";
import { db } from "./src/db.ts";
import { EventsArraySchema, LogsArraySchema } from "./src/validation.ts";

type Variables = {
  appId: string;
};

export const app = new Hono<{ Variables: Variables }>();

app.post(
  "/events",
  publicKeyAuthMiddleware,
  zValidator("json", EventsArraySchema),
  async (c) => {
    const events = c.req.valid("json");
    const appId = c.get("appId");

    // Add app_id to each event
    const eventsWithAppId = events.map((event) => ({
      ...event,
      app_id: appId,
    }));

    try {
      await db.insertInto("events").values(eventsWithAppId).execute();
      return c.json({ success: true, count: events.length });
    } catch (error) {
      return c.json({ error: "Failed to insert events" }, 500);
    }
  }
);

app.post(
  "/logs",
  publicKeyAuthMiddleware,
  zValidator("json", LogsArraySchema),
  async (c) => {
    const logs = c.req.valid("json");
    const appId = c.get("appId");

    // Add app_id to each log
    const logsWithAppId = logs.map((log) => ({
      ...log,
      app_id: appId,
    }));

    try {
      await db.insertInto("logs").values(logsWithAppId).execute();
      return c.json({ success: true, count: logs.length });
    } catch (error) {
      return c.json({ error: "Failed to insert logs" }, 500);
    }
  }
);

app.get("/events", privateKeyAuthMiddleware, async (c) => {
  const appId = c.get("appId");
  const fromTime = c.req.query("from");
  const toTime = c.req.query("to");

  if (!fromTime || !toTime) {
    return c.json(
      { error: "Both 'from' and 'to' query parameters are required" },
      400
    );
  }

  const fromTimestamp = parseInt(fromTime);
  const toTimestamp = parseInt(toTime);

  if (isNaN(fromTimestamp) || isNaN(toTimestamp)) {
    return c.json({ error: "Invalid timestamp format" }, 400);
  }

  try {
    const events = await db
      .selectFrom("events")
      .selectAll()
      .where("app_id", "=", appId)
      .where("timestamp", ">=", fromTimestamp)
      .where("timestamp", "<=", toTimestamp)
      .orderBy("timestamp", "desc")
      .execute();

    return c.json({ events, count: events.length });
  } catch (error) {
    return c.json({ error: "Failed to retrieve events" }, 500);
  }
});

app.get("/logs", privateKeyAuthMiddleware, async (c) => {
  const appId = c.get("appId");
  const fromTime = c.req.query("from");
  const toTime = c.req.query("to");

  if (!fromTime || !toTime) {
    return c.json(
      { error: "Both 'from' and 'to' query parameters are required" },
      400
    );
  }

  const fromTimestamp = parseInt(fromTime);
  const toTimestamp = parseInt(toTime);

  if (isNaN(fromTimestamp) || isNaN(toTimestamp)) {
    return c.json({ error: "Invalid timestamp format" }, 400);
  }

  try {
    const logs = await db
      .selectFrom("logs")
      .selectAll()
      .where("app_id", "=", appId)
      .where("timestamp", ">=", fromTimestamp)
      .where("timestamp", "<=", toTimestamp)
      .orderBy("timestamp", "desc")
      .execute();

    return c.json({ logs, count: logs.length });
  } catch (error) {
    return c.json({ error: "Failed to retrieve logs" }, 500);
  }
});

if (import.meta.main) {
  Deno.serve(app.fetch);
}

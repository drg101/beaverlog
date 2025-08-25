import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  publicKeyAuthMiddleware,
  privateKeyAuthMiddleware,
} from "./src/auth.ts";
import { db } from "./src/db.ts";
import { EventsArraySchema, LogsArraySchema } from "./src/validation.ts";
import { generateAppCredentials } from "./src/utils.ts";
import { trackUidsAndSessions } from "./src/tracking.ts";
import { serveStatic } from "hono/deno";

type Variables = {
  appId: string;
};

export const app = new Hono<{ Variables: Variables }>();

// Request logging middleware
app.use("*", async (c, next) => {
  const method = c.req.method;
  const url = c.req.url;
  
  let body = "";
  if (method !== "GET" && method !== "HEAD") {
    try {
      const clonedRequest = c.req.raw.clone();
      const text = await clonedRequest.text();
      if (text) {
        body = ` - ${text}`;
      }
    } catch (error) {
      // Ignore body parsing errors
    }
  }
  
  console.log(`${method} - ${url}${body}`);
  
  await next();
});

// API routes
const api = new Hono<{ Variables: Variables }>();

api.post("/apps", async (c) => {
  try {
    const credentials = generateAppCredentials();

    await db.insertInto("apps").values(credentials).execute();

    return c.json(credentials, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create app" }, 500);
  }
});

api.post(
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
      // Track UIDs and sessions
      await trackUidsAndSessions(events, appId);
      
      // Insert events
      await db.insertInto("events").values(eventsWithAppId).execute();
      return c.json({ success: true, count: events.length });
    } catch (error) {
      console.error("Failed to insert events:", error);
      return c.json({ error: "Failed to insert events" }, 500);
    }
  }
);

api.post(
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
      // Track UIDs and sessions
      await trackUidsAndSessions(logs, appId);
      
      // Insert logs
      await db.insertInto("logs").values(logsWithAppId).execute();
      return c.json({ success: true, count: logs.length });
    } catch (error) {
      console.error("Failed to insert logs:", error);
      return c.json({ error: "Failed to insert logs" }, 500);
    }
  }
);

api.get("/events", privateKeyAuthMiddleware, async (c) => {
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
    console.error("Failed to retrieve events:", error);
    return c.json({ error: "Failed to retrieve events" }, 500);
  }
});

api.get("/logs", privateKeyAuthMiddleware, async (c) => {
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
    console.error("Failed to retrieve logs:", error);
    return c.json({ error: "Failed to retrieve logs" }, 500);
  }
});

api.get("/uids", privateKeyAuthMiddleware, async (c) => {
  const appId = c.get("appId");

  try {
    const uids = await db
      .selectFrom("uids")
      .selectAll()
      .where("app_id", "=", appId)
      .orderBy("last_seen", "desc")
      .execute();

    return c.json({ uids, count: uids.length });
  } catch (error) {
    console.error("Failed to retrieve uids:", error);
    return c.json({ error: "Failed to retrieve uids" }, 500);
  }
});

api.get("/sessions", privateKeyAuthMiddleware, async (c) => {
  const appId = c.get("appId");
  const uid = c.req.query("uid");
  const startTime = c.req.query("start");
  const endTime = c.req.query("end");

  const startTimestamp = startTime ? parseInt(startTime) : null;
  const endTimestamp = endTime ? parseInt(endTime) : null;

  try {
    const sessions = await db
      .selectFrom("sessions")
      .selectAll()
      .where("app_id", "=", appId)
      .$if(!!uid, (qb) => qb.where("uid", "=", uid!))
      .$if(startTimestamp !== null && !isNaN(startTimestamp), (qb) =>
        qb.where("end_time", ">=", startTimestamp!)
      )
      .$if(endTimestamp !== null && !isNaN(endTimestamp), (qb) =>
        qb.where("start_time", "<=", endTimestamp!)
      )
      .orderBy("start_time", "desc")
      .execute();

    return c.json({ sessions, count: sessions.length });
  } catch (error) {
    console.error("Failed to retrieve sessions:", error);
    return c.json({ error: "Failed to retrieve sessions" }, 500);
  }
});

// Mount API routes
app.route("/api", api);

// Serve static files
app.use("/*", serveStatic({ root: "./frontend/dist" }));

// Fallback for SPA routing
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

if (import.meta.main) {
  Deno.serve(app.fetch);
}

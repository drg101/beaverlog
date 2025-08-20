import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Set test database URL before importing anything
Deno.env.set("DATABASE_URL", Deno.env.get("TEST_DATABASE_URL") || "");

// Import the app after setting the test database URL
const { app } = await import("./main.ts");
const { db } = await import("./src/db.ts");

const TEST_APP_ID = "test-app-123";
const TEST_TOKEN = "test-token-456";

Deno.test("API Endpoints", async (t) => {
  // Zero timeout workaround for Deno leak detection
  await new Promise((resolve) => setTimeout(resolve, 0));

  await t.step("setup test data", async () => {
    // Create test app in database
    await db
      .insertInto("apps")
      .values({
        app_id: TEST_APP_ID,
        token: TEST_TOKEN,
      })
      .execute();
  });

  await t.step("should reject requests without auth headers", async () => {
    const res = await app.request("/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
    assertEquals(res.status, 401);
  });

  await t.step("should accept valid events with auth", async () => {
    const events = [
      {
        name: "user_login",
        timestamp: 1234567890,
        session_id: "sess-123",
        uid: "user-456",
        meta: { browser: "chrome" },
      },
    ];

    const res = await app.request("/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        app_id: TEST_APP_ID,
        token: TEST_TOKEN,
      },
      body: JSON.stringify(events),
    });

    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.success, true);
    assertEquals(data.count, 1);
  });

  await t.step("should accept valid logs with auth", async () => {
    const logs = [
      {
        message: "User logged in successfully",
        uid: "user-456",
        session_id: "sess-123",
        timestamp: 1234567890,
        data: { ip: "192.168.1.1" },
      },
    ];

    const res = await app.request("/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        app_id: TEST_APP_ID,
        token: TEST_TOKEN,
      },
      body: JSON.stringify(logs),
    });

    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.success, true);
    assertEquals(data.count, 1);
  });

  await t.step("should reject invalid event data", async () => {
    const invalidEvents = [
      {
        name: "user_login",
        // missing required fields
      },
    ];

    const res = await app.request("/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        app_id: TEST_APP_ID,
        token: TEST_TOKEN,
      },
      body: JSON.stringify(invalidEvents),
    });

    assertEquals(res.status, 400);
  });

  await t.step("cleanup test data", async () => {
    // Clean up test data
    await db.deleteFrom("events").execute();
    await db.deleteFrom("logs").execute();
    await db.deleteFrom("apps").where("app_id", "=", TEST_APP_ID).execute();
    await db.destroy();
  });
});

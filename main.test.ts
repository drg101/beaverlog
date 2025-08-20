import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Set test database URL before importing anything
Deno.env.set("DATABASE_URL", Deno.env.get("TEST_DATABASE_URL") || "");

// Import the app after setting the test database URL
const { app } = await import("./main.ts");
const { db } = await import("./src/db.ts");

const TEST_APP_ID = "test-app-123";
const TEST_PUBLIC_KEY = "test-public-key-456";
const TEST_PRIVATE_KEY = "test-private-key-789";

Deno.test("API Endpoints", async (t) => {
  // Zero timeout workaround for Deno leak detection
  await new Promise((resolve) => setTimeout(resolve, 0));

  await t.step("setup test data", async () => {
    // Create test app in database
    await db
      .insertInto("apps")
      .values({
        app_id: TEST_APP_ID,
        public_key: TEST_PUBLIC_KEY,
        private_key: TEST_PRIVATE_KEY,
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
        public_key: TEST_PUBLIC_KEY,
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
        public_key: TEST_PUBLIC_KEY,
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
        public_key: TEST_PUBLIC_KEY,
      },
      body: JSON.stringify(invalidEvents),
    });

    assertEquals(res.status, 400);
  });

  await t.step("should retrieve events within time range", async () => {
    // First, add some test events
    const events = [
      {
        name: "login",
        timestamp: 1000000,
        session_id: "sess-1",
        uid: "user-1",
        meta: {},
      },
      {
        name: "logout",
        timestamp: 2000000,
        session_id: "sess-1",
        uid: "user-1",
        meta: {},
      },
    ];

    await app.request("/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        app_id: TEST_APP_ID,
        public_key: TEST_PUBLIC_KEY,
      },
      body: JSON.stringify(events),
    });

    // Now retrieve events in the time range
    const res = await app.request("/events?from=500000&to=1500000", {
      method: "GET",
      headers: {
        app_id: TEST_APP_ID,
        private_key: TEST_PRIVATE_KEY,
      },
    });

    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.count, 1);
    assertEquals(data.events[0].name, "login");
  });

  await t.step("should reject GET requests without time parameters", async () => {
    const res = await app.request("/events", {
      method: "GET",
      headers: {
        app_id: TEST_APP_ID,
        private_key: TEST_PRIVATE_KEY,
      },
    });

    assertEquals(res.status, 400);
  });

  await t.step("should retrieve logs within time range", async () => {
    // First, add some test logs
    const logs = [
      {
        message: "User login attempt",
        timestamp: 1000000,
        session_id: "sess-1",
        uid: "user-1",
        data: { ip: "192.168.1.1" },
      },
      {
        message: "User logout",
        timestamp: 2000000,
        session_id: "sess-1",
        uid: "user-1",
        data: { ip: "192.168.1.1" },
      },
    ];

    await app.request("/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        app_id: TEST_APP_ID,
        public_key: TEST_PUBLIC_KEY,
      },
      body: JSON.stringify(logs),
    });

    // Now retrieve logs in the time range
    const res = await app.request("/logs?from=500000&to=1500000", {
      method: "GET",
      headers: {
        app_id: TEST_APP_ID,
        private_key: TEST_PRIVATE_KEY,
      },
    });

    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.count, 1);
    assertEquals(data.logs[0].message, "User login attempt");
  });

  await t.step("should reject GET logs requests without time parameters", async () => {
    const res = await app.request("/logs", {
      method: "GET",
      headers: {
        app_id: TEST_APP_ID,
        private_key: TEST_PRIVATE_KEY,
      },
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

import { assertEquals } from "@std/assert/equals";
import { handler } from "./main.ts";
import { turso } from "./src/turso.ts";

const cleanup = async () => {
  await turso.execute("DELETE FROM events");
};

Deno.test("API tests", async (t) => {
  await t.step("cleanup", cleanup);

  const eventName = "test_event";
  const now = new Date();
  let eventId: string;

  await t.step("create event", async () => {
    const req = new Request("http://localhost:8000/event", {
      method: "POST",
      body: JSON.stringify({
        event_name: eventName,
        timestamp: now.toISOString(),
        meta: {},
      }),
    });
    const res = await handler(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(typeof json.event_id, "string");
    eventId = json.event_id;
  });

  await t.step("get events", async () => {
    const url = new URL("http://localhost:8000/events");
    url.searchParams.set("event_name", eventName);
    url.searchParams.set("start_ms", (now.getTime() - 1000).toString());
    url.searchParams.set("end_ms", (now.getTime() + 1000).toString());

    const req = new Request(url.toString(), {
      method: "GET",
    });

    const res = await handler(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.length, 1);
    assertEquals(json[0].id, eventId);
    assertEquals(json[0].name, eventName);
    // Allow for a small difference in timestamps
    const timestampDiff = Math.abs(
      new Date(json[0].timestamp).getTime() - now.getTime()
    );
    assertEquals(timestampDiff < 1000, true);
  });

  await t.step("get event names", async () => {
    const req = new Request("http://localhost:8000/event-names", {
      method: "GET",
    });
    const res = await handler(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json, [eventName]);
  });

  await t.step("bad request - create event", async () => {
    const req = new Request("http://localhost:8000/event", {
      method: "POST",
      body: JSON.stringify({
        // Missing event_name and timestamp
      }),
    });
    const res = await handler(req);
    assertEquals(res.status, 400);
  });

  await t.step("bad request - get events", async () => {
    const url = new URL("http://localhost:8000/events");
    // Missing required parameters
    const req = new Request(url.toString(), {
      method: "GET",
    });
    const res = await handler(req);
    assertEquals(res.status, 400);
  });

  await t.step("cleanup", cleanup);
});
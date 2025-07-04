import { assertEquals } from "@std/assert/equals";
import { handler } from "./main.ts";

const TEST_KV_LOCATION = "./test_kv";
Deno.env.set("KV_LOCATION", TEST_KV_LOCATION);

const cleanup = async () => {
  const kv = await Deno.openKv(TEST_KV_LOCATION);
  const iter = kv.list({ prefix: [] });
  for await (const res of iter) {
    await kv.delete(res.key);
  }
  kv.close();
};

Deno.test("API tests", async (t) => {
  await t.step("cleanup", cleanup);

  const eventName = "test_event";
  const now = Date.now();
  let eventId: string;

  await t.step("create event", async () => {
    const req = new Request("http://localhost:8000/event", {
      method: "POST",
      body: JSON.stringify({
        event_name: eventName,
        timestamp: now,
      }),
    });
    const res = await handler(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    console.log({ json });
    assertEquals(typeof json.event_id, "string");
    eventId = json.event_id;
  });

  await t.step("get events", async () => {
    const url = new URL("http://localhost:8000/events");
    url.searchParams.set("event_name", eventName);
    url.searchParams.set("start_ms", (now - 1000).toString());
    url.searchParams.set("end_ms", (now + 1000).toString());

    const req = new Request(url.toString(), {
      method: "GET",
    });

    const res = await handler(req);
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.length, 1);
    assertEquals(json[0].event_id, eventId);
    assertEquals(json[0].event_name, eventName);
    assertEquals(json[0].timestamp, now);
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

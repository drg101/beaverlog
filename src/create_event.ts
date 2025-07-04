import { createEventDto } from "./types/dto.ts";
import { z } from "zod";
import { getEventKey } from "./util.ts";
import { Event } from "./types/types.ts";
import { kv } from "./kv.ts";

export const createEvent = async (body: z.infer<typeof createEventDto>) => {
  const { timestamp, event_name } = body;
  const uuid = crypto.randomUUID();
  const key = getEventKey(event_name, timestamp, uuid);
  const event: Event = {
    event_id: uuid,
    ...body,
  };
  const eventNamesKey = ["event_names"];
  const eventNames = await kv.get<Set<string>>(eventNamesKey);
  const updatedEventNames = eventNames.value ?? new Set();
  updatedEventNames.add(event_name);
  const res = await kv.atomic()
    .check(eventNames)
    .set(key, event)
    .set(eventNamesKey, updatedEventNames)
    .commit();

  if (!res.ok) {
    throw new Error("Failed to create event");
  }

  return { event_id: uuid };
};

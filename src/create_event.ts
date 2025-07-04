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
  await kv.set(key, event);

  return { event_id: uuid };
};

import { turso } from "./turso.ts";
import { createEventDto } from "./types/dto.ts";
import { z } from "zod";

export const createEvent = async (body: z.infer<typeof createEventDto>) => {
  const { timestamp, event_name, meta } = body;
  const uuid = crypto.randomUUID();

  console.log({ body });

  await turso.execute({
    sql: "INSERT INTO events (id, name, timestamp, meta) VALUES (?, ?, ?, ?)",
    args: [uuid, event_name, timestamp, JSON.stringify(meta)],
  });

  console.log("DOne");

  return { event_id: uuid };
};

import { z } from "zod";

export const EventSchema = z.object({
  name: z.string(),
  timestamp: z.number(),
  uid: z.string(),
  session_id: z.string(),
  meta: z.record(z.any()).optional(),
});

export const LogSchema = z.object({
  message: z.string(),
  timestamp: z.number(),
  uid: z.string(),
  session_id: z.string(),
  data: z.record(z.any()).optional(),
});

export const EventsArraySchema = z.array(EventSchema);
export const LogsArraySchema = z.array(LogSchema);

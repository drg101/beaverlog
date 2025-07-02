import { z } from "zod";

export const anyObject = z.object({}).catchall(z.any());

export const createEventDto = z.object({
  timestamp: z.number(),
  event_name: z.string(),
  uid: z.string().optional(),
  session_id: z.string().optional(),
  metadata: anyObject.optional(),
});

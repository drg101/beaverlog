import { z } from "zod";
export const createEventDto = z.object({
  event_name: z.string(),
  uid: z.string().optional(),
  session_id: z.string().optional(),
  metadata: z.any().optional(),
});

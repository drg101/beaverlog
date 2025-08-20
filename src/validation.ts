import { z } from 'zod'

export const EventSchema = z.object({
  name: z.string(),
  timestamp: z.number(),
  session_id: z.string(),
  uid: z.string(),
  meta: z.record(z.any()).optional()
})

export const LogSchema = z.object({
  message: z.string(),
  uid: z.string(),
  session_id: z.string(),
  timestamp: z.number(),
  data: z.record(z.any()).optional()
})

export const EventsArraySchema = z.array(EventSchema)
export const LogsArraySchema = z.array(LogSchema)
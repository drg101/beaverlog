import { turso } from "./turso.ts";
import { Event } from "./types/types.ts";

export const getEvents = async (params: {
  event_name: string;
  start_ms: number;
  end_ms: number;
}): Promise<Event[]> => {
  const { event_name, start_ms, end_ms } = params;

  const query = await turso.execute({
    sql: "SELECT * FROM events WHERE name = ? AND timestamp >= ? AND timestamp <= ?",
    args: [event_name, start_ms, end_ms],
  });

  const events: Event[] = query.rows.map((row) => ({
    event_id: row.id as string,
    event_name: row.name as string,
    timestamp: Number(row.timestamp),
    meta: JSON.parse(row.meta as string),
  }));

  return events;
};

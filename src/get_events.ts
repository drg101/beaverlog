import { getTimeRangePrefixes } from "./util.ts";
import { kv } from "./kv.ts";
import { Event } from "./types/types.ts";

export const getEvents = async (params: {
  event_name: string;
  start_ms: number;
  end_ms: number;
}): Promise<Event[]> => {
  const {event_name, start_ms, end_ms} = params;
  const prefixes = getTimeRangePrefixes(event_name, start_ms, end_ms);
  const promises = prefixes.map((prefix) => kv.list<Event>({ prefix }));
  const iterators = await Promise.all(promises);

  const events: Event[] = [];
  for (const iterator of iterators) {
    for await (const { value } of iterator) {
      if (value.timestamp >= start_ms && value.timestamp <= end_ms) {
        events.push(value);
      }
    }
  }

  return events;
};

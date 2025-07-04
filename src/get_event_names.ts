import { kv } from "./kv.ts";

export const getEventNames = async (): Promise<string[]> => {
  const eventNamesKey = ["event_names"];
  const eventNames = await kv.get<Set<string>>(eventNamesKey);
  return Array.from(eventNames.value ?? []);
};

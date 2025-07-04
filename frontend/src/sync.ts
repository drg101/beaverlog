import { Event } from "./types.ts";

export const REFRESH_THRESHOLD_SEC = 5;

export const syncEvent = async (eventName: string): Promise<boolean> => {
  const eventSyncedUntilStr = localStorage.getItem(eventName);
  const eventSyncedUntil = Number(eventSyncedUntilStr ?? 0);

  const now = Date.now();
  if (now - eventSyncedUntil > REFRESH_THRESHOLD_SEC * 1000) {
    const events: Event[] = await (
      await fetch(
        `http://localhost:8000/events?event_name=${eventName}&start_ms=${eventSyncedUntil}&end_ms=${now}`
      )
    ).json();

    let anyNew = false;
    // Dump them into indexeddb

    return anyNew;
  }
  return false;
};

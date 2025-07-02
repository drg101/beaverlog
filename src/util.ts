import { TimePrefix } from "./types/types.ts";

export const getEventKey = (
  eventName: string,
  timestamp: number,
  uuid: string
): [string, string, string, string, string, string, string] => {
  return [eventName, ...timestampToKey(timestamp), uuid];
};

export const timestampToKey = (
  timestamp: number
): [string, string, string, string, string] => {
  const date = new Date(timestamp);

  return [
    `${date.getUTCFullYear()}`, // yyyy
    `${date.getUTCMonth() + 1}`, // mm (getUTCMonth() returns 0-11, so add 1)
    `${date.getUTCDate()}`, // dd
    `${date.getUTCHours()}`, // hh
    `${date.getUTCMinutes()}`, // mm
  ];
};

export const getTimeRangePrefixes = (
  eventName: string,
  startMs: number,
  endMs: number
): TimePrefix[] => {
  if (startMs > endMs) {
    return [];
  }

  const prefixes: TimePrefix[] = [];
  const endDate = new Date(endMs);

  // This ensures that ranges ending at xx:59:59 are treated as inclusive of the entire hour/day/etc.
  endDate.setUTCSeconds(59, 999);

  let current = new Date(startMs);

  while (current.getTime() <= endDate.getTime()) {
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();
    const day = current.getUTCDate();
    const hour = current.getUTCHours();
    const minute = current.getUTCMinutes();

    // Attempt to add a full year prefix.
    if (month === 0 && day === 1 && hour === 0 && minute === 0) {
      const endOfYear = new Date(Date.UTC(year + 1, 0, 1) - 1);
      if (endOfYear.getTime() <= endDate.getTime()) {
        prefixes.push([eventName, year.toString()]);
        current = new Date(endOfYear.getTime() + 1);
        continue;
      }
    }

    // Attempt to add a full month prefix.
    if (day === 1 && hour === 0 && minute === 0) {
      const endOfMonth = new Date(Date.UTC(year, month + 1, 1) - 1);
      if (endOfMonth.getTime() <= endDate.getTime()) {
        prefixes.push([eventName, year.toString(), (month + 1).toString()]);
        current = new Date(endOfMonth.getTime() + 1);
        continue;
      }
    }

    // Attempt to add a full day prefix.
    if (hour === 0 && minute === 0) {
      const endOfDay = new Date(Date.UTC(year, month, day + 1) - 1);
      if (endOfDay.getTime() <= endDate.getTime()) {
        prefixes.push([
          eventName,
          year.toString(),
          (month + 1).toString(),
          day.toString(),
        ]);
        current = new Date(endOfDay.getTime() + 1);
        continue;
      }
    }

    // Attempt to add a full hour prefix.
    if (minute === 0) {
      const endOfHour = new Date(Date.UTC(year, month, day, hour + 1) - 1);
      if (endOfHour.getTime() <= endDate.getTime()) {
        prefixes.push([
          eventName,
          year.toString(),
          (month + 1).toString(),
          day.toString(),
          hour.toString(),
        ]);
        current = new Date(endOfHour.getTime() + 1);
        continue;
      }
    }

    // If no larger block fits, add a single minute prefix and advance.
    const endOfMinute = new Date(
      Date.UTC(year, month, day, hour, minute + 1) - 1
    );
    prefixes.push([
      eventName,
      year.toString(),
      (month + 1).toString(),
      day.toString(),
      hour.toString(),
      minute.toString(),
    ]);
    current = new Date(endOfMinute.getTime() + 1);
  }

  return prefixes;
};

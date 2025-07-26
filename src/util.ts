import { TimePrefix } from "./types/types.ts";

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

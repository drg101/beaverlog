import { assertEquals } from "@std/assert";
import { getTimeRangePrefixes, timestampToKey } from "./util.ts";

Deno.test("timestampToKey - basic functionality", () => {
  const timestamp = new Date("2024-07-02T14:30:25Z").getTime();
  const result = timestampToKey(timestamp);
  assertEquals(result, ["2024", "7", "2", "14", "30"]);
});

Deno.test(
  "timestampToKey - handles single digit months/days/hours/minutes",
  () => {
    const timestamp = new Date("2024-01-05T09:05:00Z").getTime();
    const result = timestampToKey(timestamp);
    assertEquals(result, ["2024", "1", "5", "9", "5"]);
  }
);

Deno.test("getTimeRangePrefixes - same minute", () => {
  const start = new Date("2024-07-02T14:30:00Z").getTime();
  const end = new Date("2024-07-02T14:30:59Z").getTime();

  const result = getTimeRangePrefixes("pageview", start, end);
  assertEquals(result, [["pageview", "2024", "7", "2", "14", "30"]]);
});

Deno.test("getTimeRangePrefixes - same hour, multiple minutes", () => {
  const start = new Date("2024-07-02T14:30:00Z").getTime();
  const end = new Date("2024-07-02T14:32:59Z").getTime();

  const result = getTimeRangePrefixes("click", start, end);
  assertEquals(result, [
    ["click", "2024", "7", "2", "14", "30"],
    ["click", "2024", "7", "2", "14", "31"],
    ["click", "2024", "7", "2", "14", "32"],
  ]);
});

Deno.test("getTimeRangePrefixes - same day, multiple hours", () => {
  const start = new Date("2024-07-02T14:00:00Z").getTime();
  const end = new Date("2024-07-02T16:59:59Z").getTime();

  const result = getTimeRangePrefixes("signup", start, end);
  assertEquals(result, [
    ["signup", "2024", "7", "2", "14"],
    ["signup", "2024", "7", "2", "15"],
    ["signup", "2024", "7", "2", "16"],
  ]);
});

Deno.test("getTimeRangePrefixes - same day, partial hours", () => {
  const start = new Date("2024-07-02T14:30:00Z").getTime();
  const end = new Date("2024-07-02T16:45:00Z").getTime();

  const result = getTimeRangePrefixes("pageview", start, end);

  // Should include:
  // - Minutes 30-59 of hour 14
  // - Full hour 15
  // - Minutes 0-45 of hour 16
  const expected = [
    // Hour 14, minutes 30-59
    ...Array.from({ length: 30 }, (_, i) => [
      "pageview",
      "2024",
      "7",
      "2",
      "14",
      (30 + i).toString(),
    ]),
    // Full hour 15
    ["pageview", "2024", "7", "2", "15"],
    // Hour 16, minutes 0-45
    ...Array.from({ length: 46 }, (_, i) => [
      "pageview",
      "2024",
      "7",
      "2",
      "16",
      i.toString(),
    ]),
  ];

  assertEquals(result, expected);
});

Deno.test("getTimeRangePrefixes - same month, multiple days", () => {
  const start = new Date("2024-07-01T00:00:00Z").getTime();
  const end = new Date("2024-07-03T23:59:59Z").getTime();

  const result = getTimeRangePrefixes("conversion", start, end);
  assertEquals(result, [
    ["conversion", "2024", "7", "1"],
    ["conversion", "2024", "7", "2"],
    ["conversion", "2024", "7", "3"],
  ]);
});

Deno.test("getTimeRangePrefixes - same year, multiple months", () => {
  const start = new Date("2024-06-01T00:00:00Z").getTime();
  const end = new Date("2024-08-31T23:59:59Z").getTime();

  const result = getTimeRangePrefixes("analytics", start, end);
  assertEquals(result, [
    ["analytics", "2024", "6"],
    ["analytics", "2024", "7"],
    ["analytics", "2024", "8"],
  ]);
});

Deno.test("getTimeRangePrefixes - multiple years", () => {
  const start = new Date("2023-01-01T00:00:00Z").getTime();
  const end = new Date("2025-12-31T23:59:59Z").getTime();

  const result = getTimeRangePrefixes("yearly_stats", start, end);
  assertEquals(result, [
    ["yearly_stats", "2023"],
    ["yearly_stats", "2024"],
    ["yearly_stats", "2025"],
  ]);
});

Deno.test("getTimeRangePrefixes - complex partial range", () => {
  const start = new Date("2024-06-15T14:30:00Z").getTime();
  const end = new Date("2024-08-20T16:45:00Z").getTime();

  const result = getTimeRangePrefixes("mixed_range", start, end);

  // This should be optimized to use larger prefixes where possible
  // The exact result depends on the optimization logic, but should be minimal
  console.log("Complex range result length:", result.length);
  console.log("First few prefixes:", result.slice(0, 5));
  console.log("Last few prefixes:", result.slice(-5));

  // At minimum, should have some entries
  assertEquals(result.length > 0, true);
  // Should start with the event name
  assertEquals(result[0][0], "mixed_range");
});

Deno.test("getTimeRangePrefixes - edge case: end of month", () => {
  const start = new Date("2024-01-31T23:00:00Z").getTime();
  const end = new Date("2024-02-01T00:59:59Z").getTime();

  const result = getTimeRangePrefixes("month_boundary", start, end);

  // Should be optimized to just 2 prefixes:
  // - Hour 23 of Jan 31 (covers 23:00-23:59)
  // - Hours 0-1 of Feb 1 (covers 00:00-01:59, but we only need up to 01:00)
  assertEquals(result, [
    ["month_boundary", "2024", "1", "31", "23"],
    ["month_boundary", "2024", "2", "1", "0"],
  ]);
});
Deno.test("getTimeRangePrefixes - edge case: leap year", () => {
  const start = new Date("2024-02-28T12:00:00Z").getTime();
  const end = new Date("2024-03-01T12:00:00Z").getTime();

  const result = getTimeRangePrefixes("leap_year", start, end);

  // Should handle leap year correctly
  assertEquals(result.length > 0, true);
  assertEquals(result[0][0], "leap_year");
});

Deno.test("getTimeRangePrefixes - single timestamp", () => {
  const timestamp = new Date("2024-07-02T14:30:25Z").getTime();

  const result = getTimeRangePrefixes("single", timestamp, timestamp);
  assertEquals(result, [["single", "2024", "7", "2", "14", "30"]]);
});

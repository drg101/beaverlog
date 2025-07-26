import { turso } from "./turso.ts";

export const getEventNames = async (): Promise<string[]> => {
  const query = await turso.execute("SELECT DISTINCT name FROM events");
  return query.rows.map((row) => row.name as string);
};

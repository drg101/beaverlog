import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Database } from "./schema.ts";
import * as pg from "pg";

pg.types.setTypeParser(20, (val) => {
  console.log({ val });
  return parseInt(val, 10);
});

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: false,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});

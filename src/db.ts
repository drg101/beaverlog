import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database } from './schema.ts'

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: Deno.env.get('DATABASE_URL'),
    ssl: false
  })
})

export const db = new Kysely<Database>({
  dialect,
})
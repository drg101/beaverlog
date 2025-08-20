import { createMiddleware } from 'hono/factory'
import { db } from './db.ts'

export const authMiddleware = createMiddleware(async (c, next) => {
  const appId = c.req.header('app_id')
  const token = c.req.header('token')
  
  if (!appId || !token) {
    return c.json({ error: 'Missing app_id or token headers' }, 401)
  }
  
  const app = await db
    .selectFrom('apps')
    .selectAll()
    .where('app_id', '=', appId)
    .where('token', '=', token)
    .executeTakeFirst()
  
  if (!app) {
    return c.json({ error: 'Invalid app_id or token' }, 401)
  }
  
  c.set('appId', appId)
  await next()
})
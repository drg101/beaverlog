import { createMiddleware } from "hono/factory";
import { db } from "./db.ts";

type Variables = {
  appId: string;
};

export const publicKeyAuthMiddleware = createMiddleware<{
  Variables: Variables;
}>(async (c, next) => {
  const appId = c.req.header("app_id");
  const publicKey = c.req.header("public_key");

  if (!appId || !publicKey) {
    console.error({ error: "Missing app_id or public_key headers" });
    return c.json({ error: "Missing app_id or public_key headers" }, 401);
  }

  try {
    const app = await db
      .selectFrom("apps")
      .selectAll()
      .where("app_id", "=", appId)
      .where("public_key", "=", publicKey)
      .executeTakeFirst();

    if (!app) {
      console.error({
        error: "Invalid app_id or public_key",
      });
      return c.json({ error: "Invalid app_id or public_key" }, 401);
    }

    c.set("appId", appId);
    await next();
  } catch (error) {
    console.error("Public key authentication error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

export const privateKeyAuthMiddleware = createMiddleware<{
  Variables: Variables;
}>(async (c, next) => {
  const appId = c.req.header("app_id");
  const privateKey = c.req.header("private_key");

  if (!appId || !privateKey) {
    return c.json({ error: "Missing app_id or private_key headers" }, 401);
  }

  try {
    const app = await db
      .selectFrom("apps")
      .selectAll()
      .where("app_id", "=", appId)
      .where("private_key", "=", privateKey)
      .executeTakeFirst();

    if (!app) {
      return c.json({ error: "Invalid app_id or private_key" }, 401);
    }

    c.set("appId", appId);
    await next();
  } catch (error) {
    console.error("Private key authentication error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

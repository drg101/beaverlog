import { db } from "./db.ts";

export interface TrackableItem {
  uid: string;
  session_id: string;
}

export async function trackUidsAndSessions(
  items: TrackableItem[],
  appId: string
): Promise<void> {
  const uniqueUids = new Set(items.map(item => item.uid));
  const uniqueSessions = new Set(items.map(item => item.session_id));
  const currentTimestamp = Date.now();

  // Track UIDs
  for (const uid of uniqueUids) {
    // Check if UID exists
    const existingUid = await db
      .selectFrom("uids")
      .selectAll()
      .where("uid", "=", uid)
      .where("app_id", "=", appId)
      .executeTakeFirst();

    if (existingUid) {
      // Update last_seen
      await db
        .updateTable("uids")
        .set({ last_seen: currentTimestamp })
        .where("uid", "=", uid)
        .where("app_id", "=", appId)
        .execute();
    } else {
      // Insert new UID
      await db
        .insertInto("uids")
        .values({
          uid,
          app_id: appId,
          first_seen: currentTimestamp,
          last_seen: currentTimestamp,
        })
        .execute();
    }
  }

  // Track sessions
  for (const sessionId of uniqueSessions) {
    const sessionUid = items.find(item => item.session_id === sessionId)?.uid;
    if (sessionUid) {
      // Check if session exists
      const existingSession = await db
        .selectFrom("sessions")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("app_id", "=", appId)
        .executeTakeFirst();

      if (existingSession) {
        // Update end_time
        await db
          .updateTable("sessions")
          .set({ end_time: currentTimestamp })
          .where("session_id", "=", sessionId)
          .where("app_id", "=", appId)
          .execute();
      } else {
        // Insert new session
        await db
          .insertInto("sessions")
          .values({
            session_id: sessionId,
            uid: sessionUid,
            app_id: appId,
            start_time: currentTimestamp,
            end_time: currentTimestamp,
          })
          .execute();
      }
    }
  }
}
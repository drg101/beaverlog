import {
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  events: EventTable;
  logs: LogTable;
  apps: AppTable;
  uids: UidTable;
  sessions: SessionTable;
}

export interface EventTable {
  id: Generated<number>;
  name: string;
  timestamp: number;
  session_id: string;
  uid: string;
  app_id: string;
  meta: any;
}

export interface LogTable {
  id: Generated<number>;
  message: string;
  uid: string;
  session_id: string;
  timestamp: number;
  app_id: string;
  data: any;
}

export type Event = Selectable<EventTable>;
export type NewEvent = Insertable<EventTable>;
export type EventUpdate = Updateable<EventTable>;

export type Log = Selectable<LogTable>;
export type NewLog = Insertable<LogTable>;
export type LogUpdate = Updateable<LogTable>;

export interface AppTable {
  id: Generated<number>;
  app_id: string;
  public_key: string;
  private_key: string;
}

export type App = Selectable<AppTable>;
export type NewApp = Insertable<AppTable>;
export type AppUpdate = Updateable<AppTable>;

export interface UidTable {
  uid: string;
  app_id: string;
  first_seen: number;
  last_seen: number;
}

export type Uid = Selectable<UidTable>;
export type NewUid = Insertable<UidTable>;
export type UidUpdate = Updateable<UidTable>;

export interface SessionTable {
  session_id: string;
  uid: string;
  app_id: string;
  start_time: number;
  end_time: number;
}

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;

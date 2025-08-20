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
}

export interface EventTable {
  id: Generated<number>;
  name: string;
  timestamp: number;
  session_id: string;
  uid: string;
  meta: any;
}

export interface LogTable {
  id: Generated<number>;
  message: string;
  uid: string;
  session_id: string;
  timestamp: number;
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
  token: string;
}

export type App = Selectable<AppTable>;
export type NewApp = Insertable<AppTable>;
export type AppUpdate = Updateable<AppTable>;

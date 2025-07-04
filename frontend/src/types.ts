export type Event = {
  timestamp: number;
  event_id: string;
  uid?: string;
  session_id?: string;
  // deno-lint-ignore no-explicit-any
  metadata?: any;
};
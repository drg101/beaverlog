import { z, ZodTypeAny } from "zod";
import { anyObject } from "./dto.ts";

export type AnyObject = z.infer<typeof anyObject>;

export type Routes = {
  [route_name: string]: {
    pattern: URLPattern;
    method: "GET" | "POST";
    fn: (body?: z.infer<ZodTypeAny>) => unknown;
    bodySchema?: ZodTypeAny;
  };
};

export type Event = {
  timestamp: number;
  event_id: string;
  uid?: string;
  session_id?: string;
  metadata?: AnyObject;
};

export type TimePrefix = string[];

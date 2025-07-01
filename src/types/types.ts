import { z, ZodTypeAny } from "zod";

export type Routes = {
  [route_name: string]: {
    pattern: URLPattern;
    method: "GET" | "POST";
    fn: (body?: unknown) => BodyInit;
    bodySchema?: ZodTypeAny;
  };
};

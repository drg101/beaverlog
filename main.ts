import { createEvent } from "./src/create_event.ts";
import { getEvents } from "./src/get_events.ts";
import { createEventDto, getEventsDto } from "./src/types/dto.ts";
import { Routes } from "./src/types/types.ts";

const routes: Routes = {
  create_event: {
    pattern: new URLPattern({ pathname: "/event" }),
    method: "POST",
    fn: createEvent,
    bodySchema: createEventDto,
  },
  get_events: {
    pattern: new URLPattern({ pathname: "/events" }),
    method: "GET",
    fn: getEvents,
    bodySchema: getEventsDto,
  },
};

export const handler = async (req: Request): Promise<Response> => {
  for (const [route_name, route] of Object.entries(routes)) {
    if (route.pattern.exec(req.url) && route.method === req.method) {
      let json: unknown | undefined;
      if (req.body && req.method === "POST") {
        if (route.bodySchema) {
          const { data, success, error } = route.bodySchema.safeParse(
            await req.json()
          );
          if (!success) {
            return new Response(error.toString(), {
              status: 400,
            });
          }
          json = data;
        }
      } else if (req.method === "GET" && route.bodySchema) {
        const url = new URL(req.url);
        const { data, error, success } = route.bodySchema.safeParse(
          Object.fromEntries(url.searchParams.entries())
        );
        if (!success) {
          return new Response(error.toString(), {
            status: 400,
          });
        }
        json = data;
      } else if (route.bodySchema) {
        new Response("No body given", {
          status: 400,
        });
      }
      console.log(
        `${new Date().toISOString()} - ${route_name}${json ? ` ${json}` : ""}`
      );
      const res = await route.fn(json);
      return Response.json(res);
    }
  }
  return new Response("Not a route", {
    status: 400,
  });
};
Deno.serve(handler);

import { createEvent } from "./src/create_event.ts";
import { createEventDto } from "./src/types/dto.ts";
import { Routes } from "./src/types/types.ts";

const routes: Routes = {
  create_event: {
    pattern: new URLPattern({ pathname: "/event" }),
    method: "POST",
    fn: createEvent,
    bodySchema: createEventDto,
  },
};

const handler = async (req: Request): Promise<Response> => {
  for (const [route_name, route] of Object.entries(routes)) {
    if (route.pattern.exec(req.url) && route.method === req.method) {
      let json: unknown | undefined;
      if (req.body) {
        json = await req.json();
        if (route.bodySchema) {
          const { data, success, error } = route.bodySchema.safeParse(json);
          if (!success) {
            return new Response(error.toString(), {
              status: 400,
            });
          }
          json = data;
        }
      } else if (route.bodySchema) {
        new Response("No body given", {
          status: 400,
        });
      }
      console.log(
        `${new Date().toISOString()} - ${route_name}${json ? ` ${json}` : ""}`
      );
      return Response.json(route.fn(json));
    }
  }
  return new Response("Not a route", {
    status: 400,
  });
};
Deno.serve(handler);

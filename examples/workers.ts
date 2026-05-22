/**
 * Ejemplo de uso en Cloudflare Workers
 *
 * Endpoint REST que valida RUCs.
 *
 * Deploy: wrangler deploy
 */

import { parse, RucError } from "@workflow507/panama-ruc";

export interface Env {
  // Variables de entorno aquí
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    // GET /ruc/8-783-1657
    if (url.pathname.startsWith("/ruc/")) {
      const ruc = url.pathname.slice(5);

      try {
        const data = parse(ruc);
        return Response.json(data);
      } catch (e) {
        if (e instanceof RucError) {
          return Response.json(
            { error: e.code, message: e.message },
            { status: 400 },
          );
        }
        return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
      }
    }

    return new Response("Usá GET /ruc/{ruc}", { status: 404 });
  },
};

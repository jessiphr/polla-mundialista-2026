import { getStore } from "@netlify/blobs";

const STORE_NAME = "mundial2026";
const RESULTS_KEY = "results";

const INITIAL_RESULTS = {
  1:{gl:2,gv:0}, 2:{gl:2,gv:1}, 7:{gl:1,gv:1}, 8:{gl:1,gv:1},
  13:{gl:1,gv:1}, 14:{gl:0,gv:1}, 19:{gl:4,gv:1}, 20:{gl:2,gv:0},
  25:{gl:7,gv:1}, 31:{gl:2,gv:2},
};

const ADMIN_PASS = "uri2026";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const store = getStore(STORE_NAME);

  // GET: return current results
  if (req.method === "GET") {
    try {
      const data = await store.get(RESULTS_KEY, { type: "json" });
      const results = data ?? INITIAL_RESULTS;
      return new Response(JSON.stringify({ ok: true, results }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ ok: true, results: INITIAL_RESULTS }), { headers });
    }
  }

  // POST: save results (requires password)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body.password !== ADMIN_PASS) {
        return new Response(JSON.stringify({ ok: false, error: "Contraseña incorrecta" }), {
          status: 401, headers,
        });
      }
      if (!body.results || typeof body.results !== "object") {
        return new Response(JSON.stringify({ ok: false, error: "Datos inválidos" }), {
          status: 400, headers,
        });
      }
      await store.setJSON(RESULTS_KEY, body.results);
      return new Response(JSON.stringify({ ok: true, saved: Object.keys(body.results).length }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500, headers,
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: "Método no permitido" }), {
    status: 405, headers,
  });
};

export const config = {
  path: "/api/results",
};

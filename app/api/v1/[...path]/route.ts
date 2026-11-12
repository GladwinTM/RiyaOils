import { NextRequest } from "next/server";
import { handle } from "@/server/router";

export const dynamic = "force-dynamic";

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;

// The router matches by method, so run the GET logic (still hits the DB, keeping
// Supabase awake for uptime pings) and return only the headers.
export async function HEAD(req: NextRequest) {
  const res = await handle(new NextRequest(req.url, { method: "GET", headers: req.headers }));
  return new Response(null, { status: res.status, headers: res.headers });
}

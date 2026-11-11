import { query } from "./db";
import { forbidden, unauthorized } from "./http";

export type RequestUser = { id: string; email?: string; role?: "CUSTOMER" | "ADMIN" };

function readToken(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Verifies a Supabase access token by asking Supabase Auth who it belongs to. */
async function verify(token: string): Promise<RequestUser> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw unauthorized("Authentication is not configured");
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) throw unauthorized("Invalid or expired session");
  const user = (await res.json()) as { id: string; email?: string };
  return { id: user.id, email: user.email };
}

export async function requireUser(request: Request) {
  const token = readToken(request);
  if (!token) throw unauthorized();
  return verify(token);
}

/** Guests are allowed; a supplied token must still be valid. */
export async function optionalUser(request: Request) {
  const token = readToken(request);
  return token ? verify(token) : undefined;
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  const { rows } = await query<{ role: string }>(
    "select role from profiles where user_id = $1",
    [user.id],
  );
  if (rows[0]?.role !== "ADMIN") throw forbidden();
  return { ...user, role: "ADMIN" as const };
}

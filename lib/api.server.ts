import { connection } from "next/server";
import { ApiError } from "@/lib/api";
import { handle } from "@/server/router";
import type { ApiFailure, ApiSuccess } from "@/types/api";

/**
 * Server Components call the API router in-process (same response shape as
 * the public /api/v1 endpoints, without an HTTP round trip to ourselves).
 */
export async function serverApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Store data (stock, prices, settings) must be read per request, never baked in at build.
  await connection();
  const res = await handle(new Request(`http://internal/api/v1${path}`, init));
  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;
  if (!json || json.success !== true) {
    throw new ApiError(json?.message ?? "Request failed", res.status, json?.code);
  }
  return json.data;
}

/** Soft-fail helper for pages that should still render when the database is down. */
export async function apiSafe<T>(
  path: string,
  fallback: T,
  init?: RequestInit,
): Promise<{ data: T; ok: boolean; error: string | null }> {
  try {
    return { data: await serverApi<T>(path, init), ok: true, error: null };
  } catch (error) {
    return {
      data: fallback,
      ok: false,
      error:
        error instanceof ApiError && error.status < 500
          ? error.message
          : "The store could not load this right now. Please try again shortly.",
    };
  }
}

import {
  ACCESS_TOKEN_KEY,
  API_RETRY_COUNT,
  API_TIMEOUT_MS,
  API_URL,
} from "@/lib/constants";
import type { ApiFailure, ApiSuccess } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function token() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function isAbortError(error: unknown) {
  return (
    (error instanceof Error && error.name === "AbortError") ||
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError")
  );
}

function isRetryable(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 0 || error.status === 408 || error.status >= 500;
  }
  return true;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOnce<T>(path: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const bearer = token();
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const external = init.signal;
  if (external) {
    if (external.aborted) controller.abort();
    else {
      external.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as
      | ApiSuccess<T>
      | ApiFailure
      | null;

    if (!json || json.success !== true) {
      throw new ApiError(
        json?.message ??
          (res.status === 504
            ? "The store is taking too long to respond. Please try again."
            : "Request failed"),
        res.status,
        json && "code" in json ? json.code : undefined,
      );
    }

    return json.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isAbortError(error)) {
      throw new ApiError(
        "The store is taking too long to respond. Please try again.",
        408,
        "TIMEOUT",
      );
    }
    throw new ApiError(
      "Could not reach the store. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  } finally {
    clearTimeout(timer);
  }
}

export type ApiOptions = {
  /** Per-request timeout; defaults to API_TIMEOUT_MS. */
  timeoutMs?: number;
};

export async function api<T>(
  path: string,
  init: RequestInit = {},
  options: ApiOptions = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  // Writes are only retried when an Idempotency-Key makes repeating them safe.
  const idempotent = method === "GET" || new Headers(init.headers).has("Idempotency-Key");
  const retries = idempotent ? API_RETRY_COUNT : 0;
  const timeoutMs = options.timeoutMs ?? API_TIMEOUT_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchOnce<T>(path, init, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt >= retries || !isRetryable(error)) break;
      await sleep(400 * (attempt + 1));
    }
  }

  throw lastError;
}

/** Soft-fail helper for client components. Server Components use lib/api.server. */
export async function apiSafe<T>(
  path: string,
  fallback: T,
  init?: RequestInit,
): Promise<{ data: T; ok: boolean; error: string | null }> {
  try {
    const data = await api<T>(path, init);
    return { data, ok: true, error: null };
  } catch (error) {
    return {
      data: fallback,
      ok: false,
      error:
        error instanceof ApiError
          ? error.message
          : "Something went wrong while loading.",
    };
  }
}

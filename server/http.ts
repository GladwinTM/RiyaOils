export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, code = "VALIDATION_ERROR") =>
  new HttpError(400, message, code);
export const unauthorized = (message = "Authentication token is required") =>
  new HttpError(401, message, "UNAUTHORIZED");
export const forbidden = (message = "Admin access is required") =>
  new HttpError(403, message, "FORBIDDEN");
export const notFound = (message: string, code = "NOT_FOUND") =>
  new HttpError(404, message, code);

export function ok(data: unknown, status = 200) {
  return Response.json(
    { success: true, data, message: "Request completed successfully" },
    { status },
  );
}

export function fail(error: unknown, path: string) {
  if (error instanceof HttpError) {
    return Response.json(
      { success: false, data: null, message: error.message, code: error.code, path },
      { status: error.status },
    );
  }
  // Postgres constraint violations are client errors, not crashes.
  const pg = error as { code?: string; detail?: string };
  if (pg?.code === "23505") {
    return Response.json(
      { success: false, data: null, message: "A record with this value already exists", code: "CONFLICT", path },
      { status: 409 },
    );
  }
  if (pg?.code === "22P02" || pg?.code === "23503" || pg?.code === "23514") {
    return Response.json(
      { success: false, data: null, message: "Invalid request data", code: "VALIDATION_ERROR", path },
      { status: 400 },
    );
  }
  console.error(`[api] ${path}`, error);
  return Response.json(
    { success: false, data: null, message: "Internal server error", path },
    { status: 500 },
  );
}

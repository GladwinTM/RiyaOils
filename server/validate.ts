import { badRequest } from "./http";

/** Tiny body validators replacing the old class-validator DTOs. */
type Body = Record<string, unknown>;

export function asObject(value: unknown, name = "body"): Body {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw badRequest(`${name} must be an object`);
  }
  return value as Body;
}

export function str(
  body: Body,
  key: string,
  opts: { optional?: boolean; max?: number; pattern?: RegExp; email?: boolean } = {},
): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    if (opts.optional) return undefined;
    throw badRequest(`${key} is required`);
  }
  if (typeof value !== "string") throw badRequest(`${key} must be a string`);
  const v = value.trim();
  if (!opts.optional && !v) throw badRequest(`${key} is required`);
  if (opts.max && v.length > opts.max) throw badRequest(`${key} is too long`);
  if (opts.pattern && !opts.pattern.test(v)) throw badRequest(`${key} is invalid`);
  if (opts.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    throw badRequest(`${key} must be an email`);
  }
  return v;
}

export function num(
  body: Body,
  key: string,
  opts: { optional?: boolean; min?: number; max?: number; int?: boolean } = {},
): number | undefined {
  const raw = body[key];
  if (raw === undefined || raw === null || raw === "") {
    if (opts.optional) return undefined;
    throw badRequest(`${key} is required`);
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) throw badRequest(`${key} must be a number`);
  if (opts.int && !Number.isInteger(value)) throw badRequest(`${key} must be an integer`);
  if (opts.min !== undefined && value < opts.min) throw badRequest(`${key} must be at least ${opts.min}`);
  if (opts.max !== undefined && value > opts.max) throw badRequest(`${key} must be at most ${opts.max}`);
  return value;
}

export function bool(body: Body, key: string): boolean | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "boolean") throw badRequest(`${key} must be a boolean`);
  return value;
}

export function only(body: Body, allowed: string[]) {
  const extra = Object.keys(body).filter((k) => !allowed.includes(k));
  if (extra.length) throw badRequest(`property ${extra[0]} should not exist`);
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

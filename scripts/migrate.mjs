// Applies database/migrations/*.sql in order, once each.
// Usage: npm run db:migrate   (reads DATABASE_URL from .env)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const local = ["localhost", "127.0.0.1"].includes(new URL(url).hostname);
const client = new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
const dir = path.join(import.meta.dirname, "..", "database", "migrations");

await client.connect();
try {
  // Tracking table lives in a non-API schema so it is never exposed through PostgREST.
  await client.query(`create schema if not exists riya_meta;
    create table if not exists riya_meta.migrations (name text primary key, applied_at timestamptz not null default now());`);

  // Databases created before this runner existed already have 001 applied.
  const baseline = await client.query("select to_regclass('public.products') is not null as exists");
  if (baseline.rows[0].exists) {
    await client.query("insert into riya_meta.migrations(name) values ('001_initial_schema.sql') on conflict do nothing");
  }

  const applied = new Set((await client.query("select name from riya_meta.migrations")).rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    process.stdout.write(`applying ${file} … `);
    await client.query(await readFile(path.join(dir, file), "utf8"));
    await client.query("insert into riya_meta.migrations(name) values ($1)", [file]);
    console.log("done");
  }
  console.log("migrations up to date");
} finally {
  await client.end();
}

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

/** Anything that can run a parameterised query: the pool helper or a transaction client. */
export type SqlClient = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
};

const globalForDb = globalThis as unknown as { riyaPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const host = new URL(connectionString).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  return new Pool({
    connectionString,
    // Small pool: serverless functions each hold their own pool.
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
}

export function pool() {
  globalForDb.riyaPool ??= createPool();
  return globalForDb.riyaPool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return pool().query<T>(text, values);
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function pagination(page?: unknown, limit?: unknown) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: safePage, limit: safeLimit, from: (safePage - 1) * safeLimit };
}

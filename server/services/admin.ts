import { query } from "../db";
import { notFound } from "../http";

export async function dashboardStats() {
  const r = await query<{ status: string; total: string; created_at: Date }>(
    "select status,total,created_at from orders where status <> 'CANCELLED'",
  );
  const day = new Map<string, number>();
  for (const o of r.rows) {
    const d = o.created_at.toISOString().slice(0, 10);
    day.set(d, (day.get(d) ?? 0) + Number(o.total));
  }
  return {
    totalOrders: r.rows.length,
    totalSales: r.rows.reduce((n, o) => n + Number(o.total), 0),
    pendingOrders: r.rows.filter((o) => o.status === "PENDING").length,
    deliveredOrders: r.rows.filter((o) => o.status === "DELIVERED").length,
    salesByDate: [...day].map(([date, sales]) => ({ date, sales })),
  };
}

export async function listCustomers() {
  return (await query("select * from profiles where role='CUSTOMER' order by created_at desc")).rows;
}

export async function getCustomer(userId: string) {
  const r = await query("select * from profiles where user_id=$1", [userId]);
  if (!r.rows[0]) throw notFound("Customer not found");
  return r.rows[0];
}

export async function customerOrders(userId: string) {
  await getCustomer(userId);
  return (await query("select * from orders where user_id=$1 order by created_at desc", [userId])).rows;
}

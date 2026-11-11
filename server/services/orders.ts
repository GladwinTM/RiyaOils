import { pagination, query, transaction, type SqlClient } from "../db";
import { badRequest, forbidden, notFound } from "../http";
import type { RequestUser } from "../auth";

export type CreateOrderInput = {
  items: { variantId: string; quantity: number }[];
  customer: { name: string; phone: string; email: string };
  shippingAddress: { addressLine: string; city: string; district: string; state: string; pincode: string };
};

type Variant = {
  id: string;
  product_id: string;
  name: string;
  price: string;
  sale_price: string | null;
  stock: number;
  is_active: boolean;
  product_name: string;
  product_active: boolean;
};
type Order = { id: string; user_id: string | null; status: string };

export const ORDER_STATUSES = [
  "PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED",
] as const;

const transitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function detailWith(client: SqlClient, id: string, user?: RequestUser, admin = false) {
  const r = await client.query<Order & Record<string, unknown>>("select * from orders where id=$1", [id]);
  const o = r.rows[0];
  if (!o) throw notFound("Order not found", "ORDER_NOT_FOUND");
  if (!admin && o.user_id !== user?.id) throw forbidden("You cannot access this order");
  const [items, history] = await Promise.all([
    client.query("select * from order_items where order_id=$1", [id]),
    client.query("select * from order_status_history where order_id=$1 order by created_at", [id]),
  ]);
  return { ...o, items: items.rows, statusHistory: history.rows };
}

export async function createOrder(dto: CreateOrderInput, user?: RequestUser) {
  const ids = dto.items.map((i) => i.variantId);
  if (new Set(ids).size !== ids.length) throw badRequest("Each variant can appear only once");

  return transaction(async (c) => {
    const vr = await c.query<Variant>(
      "select v.*,p.name product_name,p.is_active product_active from product_variants v join products p on p.id=v.product_id where v.id=any($1::uuid[]) for update of v",
      [ids],
    );
    if (vr.rows.length !== ids.length) throw notFound("A product variant was not found", "VARIANT_NOT_FOUND");
    const map = new Map(vr.rows.map((v) => [v.id, v]));
    let subtotal = 0;
    for (const i of dto.items) {
      const v = map.get(i.variantId)!;
      if (!v.is_active || !v.product_active) throw badRequest(`Variant ${v.name} is unavailable`, "VARIANT_NOT_FOUND");
      if (v.stock < i.quantity) throw badRequest(`Insufficient stock for ${v.product_name} ${v.name}`, "INSUFFICIENT_STOCK");
      subtotal += Number(v.sale_price ?? v.price) * i.quantity;
    }
    const sr = await c.query<{ shipping_fee: string; free_shipping_threshold: string }>(
      "select shipping_fee,free_shipping_threshold from store_settings limit 1",
    );
    if (!sr.rows[0]) throw badRequest("Store settings are not configured", "SETTINGS_NOT_FOUND");
    const shipping = subtotal >= Number(sr.rows[0].free_shipping_threshold) ? 0 : Number(sr.rows[0].shipping_fee);

    const o = await c.query<{ id: string }>(
      "insert into orders(order_number,user_id,customer_name,customer_phone,customer_email,shipping_address,city,district,state,pincode,subtotal,shipping_fee,total) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id",
      [
        `RIYA-${Date.now()}`,
        user?.id ?? null,
        dto.customer.name,
        dto.customer.phone,
        dto.customer.email,
        dto.shippingAddress.addressLine,
        dto.shippingAddress.city,
        dto.shippingAddress.district,
        dto.shippingAddress.state,
        dto.shippingAddress.pincode,
        subtotal,
        shipping,
        subtotal + shipping,
      ],
    );
    for (const i of dto.items) {
      const v = map.get(i.variantId)!;
      const price = Number(v.sale_price ?? v.price);
      const stock = await c.query(
        "update product_variants set stock=stock-$1 where id=$2 and stock>=$1 returning id",
        [i.quantity, v.id],
      );
      if (!stock.rowCount) throw badRequest(`Insufficient stock for ${v.product_name} ${v.name}`, "INSUFFICIENT_STOCK");
      await c.query(
        "insert into order_items(order_id,product_id,variant_id,product_name,variant_name,quantity,unit_price,total_price) values($1,$2,$3,$4,$5,$6,$7,$8)",
        [o.rows[0].id, v.product_id, v.id, v.product_name, v.name, i.quantity, price, price * i.quantity],
      );
    }
    await c.query(
      "insert into order_status_history(order_id,status,note,updated_by) values($1,$2,$3,$4)",
      [o.rows[0].id, "PENDING", "Order placed", user?.id ?? null],
    );
    return detailWith(c, o.rows[0].id, user, true);
  });
}

export async function listOrdersForUser(user: RequestUser) {
  return (await query("select * from orders where user_id=$1 order by created_at desc", [user.id])).rows;
}

export function orderDetail(id: string, user?: RequestUser, admin = false) {
  return detailWith({ query }, id, user, admin);
}

export async function changeOrderStatus(id: string, status: string, note: string, updatedBy?: string, bypass = false) {
  return transaction(async (c) => {
    const o = (await c.query<Order>("select * from orders where id=$1 for update", [id])).rows[0];
    if (!o) throw notFound("Order not found", "ORDER_NOT_FOUND");
    if (["DELIVERED", "CANCELLED"].includes(o.status) || (!bypass && !transitions[o.status]?.includes(status))) {
      throw badRequest(`Cannot move an order from ${o.status} to ${status}`, "INVALID_ORDER_STATUS");
    }
    await c.query("update orders set status=$2 where id=$1", [id, status]);
    await c.query(
      "insert into order_status_history(order_id,status,note,updated_by) values($1,$2,$3,$4)",
      [id, status, note, updatedBy ?? null],
    );
    return detailWith(c, id, undefined, true);
  });
}

export async function cancelOrder(id: string, user: RequestUser) {
  const o = await orderDetail(id, user);
  if (!["PENDING", "CONFIRMED"].includes(o.status)) {
    throw badRequest("This order can no longer be cancelled", "ORDER_CANNOT_BE_CANCELLED");
  }
  return changeOrderStatus(id, "CANCELLED", "Cancelled by customer", user.id, true);
}

export async function listOrdersAdmin(q: { status?: string | null; search?: string | null; page?: unknown; limit?: unknown }) {
  const p = pagination(q.page, q.limit);
  const values: unknown[] = [];
  const where: string[] = [];
  if (q.status) {
    values.push(q.status);
    where.push(`status=$${values.length}`);
  }
  if (q.search) {
    values.push(`%${q.search}%`);
    where.push(`(order_number ilike $${values.length} or customer_name ilike $${values.length} or customer_phone ilike $${values.length})`);
  }
  const w = where.length ? "where " + where.join(" and ") : "";
  const n = await query<{ count: string }>(`select count(*) from orders ${w}`, values);
  values.push(p.limit, p.from);
  const rows = await query(`select * from orders ${w} order by created_at desc limit $${values.length - 1} offset $${values.length}`, values);
  const total = Number(n.rows[0].count);
  return {
    items: rows.rows,
    pagination: { page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) },
  };
}

import { pagination, query, transaction, type SqlClient } from "../db";
import { notFound } from "../http";

// ---------------------------------------------------------------- categories
export type CategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export async function listCategories(admin = false) {
  const r = await query(
    `select * from categories ${admin ? "" : "where is_active=true"} order by name`,
  );
  return r.rows;
}

export async function createCategory(d: CategoryInput) {
  const r = await query(
    "insert into categories(name,slug,description,image_url,is_active) values($1,$2,$3,$4,$5) returning *",
    [d.name, d.slug, d.description ?? null, d.imageUrl ?? null, d.isActive ?? true],
  );
  return r.rows[0];
}

export async function updateCategory(id: string, d: CategoryInput) {
  const r = await query(
    "update categories set name=coalesce($2,name),slug=coalesce($3,slug),description=coalesce($4,description),image_url=coalesce($5,image_url),is_active=coalesce($6,is_active) where id=$1 returning *",
    [id, d.name ?? null, d.slug ?? null, d.description ?? null, d.imageUrl ?? null, d.isActive ?? null],
  );
  if (!r.rows[0]) throw notFound("Category not found", "CATEGORY_NOT_FOUND");
  return r.rows[0];
}

export async function deleteCategory(id: string) {
  const r = await query("delete from categories where id=$1", [id]);
  if (!r.rowCount) throw notFound("Category not found", "CATEGORY_NOT_FOUND");
  return { id, deleted: true };
}

// ------------------------------------------------------------------ products
export type VariantInput = {
  name: string;
  size: number;
  unit: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  isActive?: boolean;
};

export type ProductInput = {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  weight?: string;
  ingredients?: string;
  thumbnailUrl?: string;
  images?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: VariantInput[];
};

const PRODUCT_SELECT = `select p.*,json_build_object('name',c.name,'slug',c.slug) categories,
  coalesce(json_agg(v.* order by v.price) filter (where v.id is not null),'[]') product_variants
  from products p join categories c on c.id=p.category_id
  left join product_variants v on v.product_id=p.id`;

export async function listProducts(
  q: { search?: string | null; category?: string | null; page?: unknown; limit?: unknown },
  admin = false,
) {
  const p = pagination(q.page, q.limit);
  const values: unknown[] = [];
  const where: string[] = [];
  if (!admin) where.push("p.is_active=true");
  if (q.category) {
    values.push(q.category);
    where.push(`c.slug=$${values.length}`);
  }
  if (q.search) {
    values.push(`%${q.search}%`);
    where.push(`(p.name ilike $${values.length} or c.name ilike $${values.length})`);
  }
  const w = where.length ? "where " + where.join(" and ") : "";
  const n = await query<{ count: string }>(
    `select count(*) from products p join categories c on c.id=p.category_id ${w}`,
    values,
  );
  values.push(p.limit, p.from);
  const r = await query(
    `${PRODUCT_SELECT} ${w} group by p.id,c.name,c.slug order by p.created_at desc limit $${values.length - 1} offset $${values.length}`,
    values,
  );
  const total = Number(n.rows[0].count);
  return {
    items: r.rows,
    pagination: { page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) },
  };
}

export async function getProduct(idOrSlug: string, admin = false, client: SqlClient = { query }) {
  const r = await client.query(
    `${PRODUCT_SELECT} where (p.id::text=$1 or p.slug=$1) ${admin ? "" : "and p.is_active=true"} group by p.id,c.name,c.slug`,
    [idOrSlug],
  );
  if (!r.rows[0]) throw notFound("Product not found", "PRODUCT_NOT_FOUND");
  return r.rows[0];
}

async function insertVariant(client: SqlClient, productId: string, x: VariantInput) {
  await client.query(
    "insert into product_variants(product_id,name,size,unit,sku,price,sale_price,stock,is_active) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [productId, x.name, x.size, x.unit, x.sku, x.price, x.salePrice ?? null, x.stock, x.isActive ?? true],
  );
}

export async function createProduct(d: ProductInput) {
  return transaction(async (c) => {
    const r = await c.query<{ id: string }>(
      "insert into products(name,slug,description,short_description,category_id,weight,ingredients,thumbnail_url,images,is_featured,is_active) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id",
      [
        d.name, d.slug, d.description, d.shortDescription, d.categoryId,
        d.weight ?? null, d.ingredients ?? null, d.thumbnailUrl ?? null,
        JSON.stringify(d.images ?? []), d.isFeatured ?? false, d.isActive ?? true,
      ],
    );
    for (const v of d.variants ?? []) await insertVariant(c, r.rows[0].id, v);
    return getProduct(r.rows[0].id, true, c);
  });
}

export async function updateProduct(id: string, d: ProductInput) {
  return transaction(async (c) => {
    const old = await getProduct(id, true, c);
    await c.query(
      "update products set name=$2,slug=$3,description=$4,short_description=$5,category_id=$6,weight=$7,ingredients=$8,thumbnail_url=$9,images=$10,is_featured=$11,is_active=$12 where id=$1",
      [
        old.id,
        d.name ?? old.name,
        d.slug ?? old.slug,
        d.description ?? old.description,
        d.shortDescription ?? old.short_description,
        d.categoryId ?? old.category_id,
        d.weight ?? old.weight,
        d.ingredients ?? old.ingredients,
        d.thumbnailUrl ?? old.thumbnail_url,
        JSON.stringify(d.images ?? old.images ?? []),
        d.isFeatured ?? old.is_featured,
        d.isActive ?? old.is_active,
      ],
    );
    if (d.variants) {
      await c.query("delete from product_variants where product_id=$1", [old.id]);
      for (const v of d.variants) await insertVariant(c, old.id, v);
    }
    return getProduct(old.id, true, c);
  });
}

export async function deleteProduct(id: string) {
  const r = await query("delete from products where id=$1", [id]);
  if (!r.rowCount) throw notFound("Product not found", "PRODUCT_NOT_FOUND");
  return { id, deleted: true };
}

export async function updateVariant(id: string, d: Partial<VariantInput>) {
  const r = await query(
    "update product_variants set stock=coalesce($2,stock),price=coalesce($3,price),sale_price=coalesce($4,sale_price),is_active=coalesce($5,is_active) where id=$1 returning *",
    [id, d.stock ?? null, d.price ?? null, d.salePrice ?? null, d.isActive ?? null],
  );
  if (!r.rows[0]) throw notFound("Variant not found", "VARIANT_NOT_FOUND");
  return r.rows[0];
}

// ------------------------------------------------------- settings & contact
export type SettingsInput = {
  storeName?: string;
  currency?: string;
  shippingFee?: number;
  freeShippingThreshold?: number;
  supportPhone?: string;
  supportEmail?: string;
};

export async function getSettings() {
  const r = await query("select * from store_settings limit 1");
  if (!r.rows[0]) throw notFound("Store settings not found", "SETTINGS_NOT_FOUND");
  return r.rows[0];
}

export async function updateSettings(d: SettingsInput) {
  const current = await getSettings();
  const r = await query(
    "update store_settings set store_name=coalesce($2,store_name),currency=coalesce($3,currency),shipping_fee=coalesce($4,shipping_fee),free_shipping_threshold=coalesce($5,free_shipping_threshold),support_phone=coalesce($6,support_phone),support_email=coalesce($7,support_email) where id=$1 returning *",
    [
      current.id, d.storeName ?? null, d.currency ?? null, d.shippingFee ?? null,
      d.freeShippingThreshold ?? null, d.supportPhone ?? null, d.supportEmail ?? null,
    ],
  );
  return r.rows[0];
}

export const CONTACT_FIELDS = {
  businessName: "business_name",
  phone: "phone",
  email: "email",
  whatsapp: "whatsapp",
  address: "address",
  googleMapsUrl: "google_maps_url",
  instagramUrl: "instagram_url",
  facebookUrl: "facebook_url",
  businessHours: "business_hours",
} as const;

export async function getContact() {
  const r = await query("select * from contact_settings limit 1");
  if (!r.rows[0]) throw notFound("Contact settings not found", "CONTACT_NOT_FOUND");
  return r.rows[0];
}

export async function updateContact(d: Partial<Record<keyof typeof CONTACT_FIELDS, string>>) {
  const current = await getContact();
  const keys = Object.keys(CONTACT_FIELDS) as (keyof typeof CONTACT_FIELDS)[];
  const sets = keys.map((k, i) => `${CONTACT_FIELDS[k]}=coalesce($${i + 2},${CONTACT_FIELDS[k]})`);
  const r = await query(
    `update contact_settings set ${sets.join(",")} where id=$1 returning *`,
    [current.id, ...keys.map((k) => d[k] ?? null)],
  );
  return r.rows[0];
}

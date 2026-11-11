import { optionalUser, requireAdmin, requireUser } from "./auth";
import { badRequest, fail, HttpError, ok } from "./http";
import { asObject, bool, num, only, SLUG, str, UUID } from "./validate";
import * as catalog from "./services/catalog";
import * as orders from "./services/orders";
import * as admin from "./services/admin";
import { homeInsights } from "./services/insights";

type Ctx = {
  request: Request;
  params: Record<string, string>;
  search: URLSearchParams;
  body: () => Promise<Record<string, unknown>>;
};
type Handler = (ctx: Ctx) => Promise<unknown>;
type Route = { method: string; segments: string[]; handler: Handler; status?: number };

const routes: Route[] = [];
function on(method: string, pattern: string, handler: Handler, status?: number) {
  routes.push({ method, segments: pattern.split("/").filter(Boolean), handler, status });
}

// ---------------------------------------------------------------- validators
function categoryInput(b: Record<string, unknown>, partial: boolean): catalog.CategoryInput {
  only(b, ["name", "slug", "description", "imageUrl", "isActive"]);
  return {
    name: str(b, "name", { optional: partial, max: 120 }),
    slug: str(b, "slug", { optional: partial, pattern: SLUG }),
    description: str(b, "description", { optional: true }),
    imageUrl: str(b, "imageUrl", { optional: true }),
    isActive: bool(b, "isActive"),
  };
}

function variantInput(raw: unknown, partial: boolean): catalog.VariantInput {
  const b = asObject(raw, "variant");
  only(b, ["name", "size", "unit", "sku", "price", "salePrice", "stock", "isActive"]);
  return {
    name: str(b, "name", { optional: partial })!,
    size: num(b, "size", { optional: partial, min: 0.01 })!,
    unit: str(b, "unit", { optional: partial, pattern: /^(ml|L|g|kg)$/ })!,
    sku: str(b, "sku", { optional: partial })!,
    price: num(b, "price", { optional: partial, min: 0 })!,
    salePrice: num(b, "salePrice", { optional: true, min: 0 }),
    stock: num(b, "stock", { optional: partial, min: 0, int: true })!,
    isActive: bool(b, "isActive"),
  };
}

function productInput(b: Record<string, unknown>, partial: boolean): catalog.ProductInput {
  only(b, [
    "name", "slug", "description", "shortDescription", "categoryId", "weight",
    "ingredients", "thumbnailUrl", "images", "isFeatured", "isActive", "variants",
  ]);
  if (b.images !== undefined && (!Array.isArray(b.images) || b.images.some((i) => typeof i !== "string"))) {
    throw badRequest("images must be an array of strings");
  }
  if (b.variants !== undefined && !Array.isArray(b.variants)) throw badRequest("variants must be an array");
  return {
    name: str(b, "name", { optional: partial, max: 180 }),
    slug: str(b, "slug", { optional: partial, pattern: SLUG }),
    description: str(b, "description", { optional: partial }),
    shortDescription: str(b, "shortDescription", { optional: partial }),
    categoryId: str(b, "categoryId", { optional: partial, pattern: UUID }),
    weight: str(b, "weight", { optional: true }),
    ingredients: str(b, "ingredients", { optional: true }),
    thumbnailUrl: str(b, "thumbnailUrl", { optional: true }),
    images: b.images as string[] | undefined,
    isFeatured: bool(b, "isFeatured"),
    isActive: bool(b, "isActive"),
    variants: (b.variants as unknown[] | undefined)?.map((v) => variantInput(v, false)),
  };
}

function orderInput(b: Record<string, unknown>): orders.CreateOrderInput {
  only(b, ["items", "customer", "shippingAddress"]);
  if (!Array.isArray(b.items) || b.items.length < 1) throw badRequest("items must contain at least 1 element");
  const items = b.items.map((raw) => {
    const i = asObject(raw, "item");
    only(i, ["variantId", "quantity"]);
    return {
      variantId: str(i, "variantId", { pattern: UUID })!,
      quantity: num(i, "quantity", { min: 1, max: 100, int: true })!,
    };
  });
  const c = asObject(b.customer, "customer");
  only(c, ["name", "phone", "email"]);
  const a = asObject(b.shippingAddress, "shippingAddress");
  only(a, ["addressLine", "city", "district", "state", "pincode"]);
  return {
    items,
    customer: {
      name: str(c, "name", { max: 120 })!,
      phone: str(c, "phone", { pattern: /^\d{10,15}$/ })!,
      email: str(c, "email", { email: true })!,
    },
    shippingAddress: {
      addressLine: str(a, "addressLine")!,
      city: str(a, "city")!,
      district: str(a, "district")!,
      state: str(a, "state")!,
      pincode: str(a, "pincode", { pattern: /^\d{6}$/ })!,
    },
  };
}

// -------------------------------------------------------------------- public
on("GET", "health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
on("GET", "categories", () => catalog.listCategories());
on("GET", "products", async ({ search }) =>
  catalog.listProducts({
    search: search.get("search"),
    category: search.get("category"),
    page: search.get("page"),
    limit: search.get("limit"),
  }),
);
on("GET", "products/:id", ({ params }) => catalog.getProduct(params.id));
on("GET", "settings", () => catalog.getSettings());
on("GET", "content/contact", () => catalog.getContact());
on("GET", "insights/home", () => homeInsights());

// -------------------------------------------------------------------- orders
on("POST", "orders", async ({ request, body }) => {
  const input = orderInput(await body());
  return orders.createOrder(input, await optionalUser(request));
}, 201);
on("GET", "orders", async ({ request }) => orders.listOrdersForUser(await requireUser(request)));
on("GET", "orders/:id", async ({ request, params }) =>
  orders.orderDetail(params.id, await requireUser(request)),
);
on("PATCH", "orders/:id/cancel", async ({ request, params }) =>
  orders.cancelOrder(params.id, await requireUser(request)),
);

// --------------------------------------------------------------------- admin
on("GET", "admin/categories", async ({ request }) => {
  await requireAdmin(request);
  return catalog.listCategories(true);
});
on("POST", "admin/categories", async ({ request, body }) => {
  await requireAdmin(request);
  return catalog.createCategory(categoryInput(await body(), false));
}, 201);
on("PATCH", "admin/categories/:id", async ({ request, params, body }) => {
  await requireAdmin(request);
  return catalog.updateCategory(params.id, categoryInput(await body(), true));
});
on("DELETE", "admin/categories/:id", async ({ request, params }) => {
  await requireAdmin(request);
  return catalog.deleteCategory(params.id);
});

on("GET", "admin/products", async ({ request, search }) => {
  await requireAdmin(request);
  return catalog.listProducts({ page: search.get("page"), limit: search.get("limit") }, true);
});
on("POST", "admin/products", async ({ request, body }) => {
  await requireAdmin(request);
  return catalog.createProduct(productInput(await body(), false));
}, 201);
on("GET", "admin/products/:id", async ({ request, params }) => {
  await requireAdmin(request);
  return catalog.getProduct(params.id, true);
});
on("PATCH", "admin/products/:id", async ({ request, params, body }) => {
  await requireAdmin(request);
  return catalog.updateProduct(params.id, productInput(await body(), true));
});
on("DELETE", "admin/products/:id", async ({ request, params }) => {
  await requireAdmin(request);
  return catalog.deleteProduct(params.id);
});
on("PATCH", "admin/products/variants/:id", async ({ request, params, body }) => {
  await requireAdmin(request);
  return catalog.updateVariant(params.id, variantInput(await body(), true));
});

on("GET", "admin/orders", async ({ request, search }) => {
  await requireAdmin(request);
  return orders.listOrdersAdmin({
    status: search.get("status"),
    search: search.get("search"),
    page: search.get("page"),
    limit: search.get("limit"),
  });
});
on("GET", "admin/orders/:id", async ({ request, params }) => {
  await requireAdmin(request);
  return orders.orderDetail(params.id, undefined, true);
});
on("PATCH", "admin/orders/:id/status", async ({ request, params, body }) => {
  const user = await requireAdmin(request);
  const b = await body();
  only(b, ["status", "note"]);
  const status = str(b, "status")!;
  if (!(orders.ORDER_STATUSES as readonly string[]).includes(status)) throw badRequest("status is invalid");
  return orders.changeOrderStatus(params.id, status, str(b, "note")!, user.id);
});

on("GET", "admin/settings", async ({ request }) => {
  await requireAdmin(request);
  return catalog.getSettings();
});
on("PATCH", "admin/settings", async ({ request, body }) => {
  await requireAdmin(request);
  const b = await body();
  only(b, ["storeName", "currency", "shippingFee", "freeShippingThreshold", "supportPhone", "supportEmail"]);
  return catalog.updateSettings({
    storeName: str(b, "storeName", { optional: true }),
    currency: str(b, "currency", { optional: true, pattern: /^[A-Z]{3}$/ }),
    shippingFee: num(b, "shippingFee", { optional: true, min: 0 }),
    freeShippingThreshold: num(b, "freeShippingThreshold", { optional: true, min: 0 }),
    supportPhone: str(b, "supportPhone", { optional: true }),
    supportEmail: str(b, "supportEmail", { optional: true, email: true }),
  });
});

on("GET", "admin/content/contact", async ({ request }) => {
  await requireAdmin(request);
  return catalog.getContact();
});
on("PATCH", "admin/content/contact", async ({ request, body }) => {
  await requireAdmin(request);
  const b = await body();
  const keys = Object.keys(catalog.CONTACT_FIELDS);
  only(b, keys);
  return catalog.updateContact(
    Object.fromEntries(keys.map((k) => [k, str(b, k, { optional: true, email: k === "email" })])),
  );
});

on("GET", "admin/dashboard/stats", async ({ request }) => {
  await requireAdmin(request);
  return admin.dashboardStats();
});
on("GET", "admin/customers", async ({ request }) => {
  await requireAdmin(request);
  return admin.listCustomers();
});
on("GET", "admin/customers/:id", async ({ request, params }) => {
  await requireAdmin(request);
  return admin.getCustomer(params.id);
});
on("GET", "admin/customers/:id/orders", async ({ request, params }) => {
  await requireAdmin(request);
  return admin.customerOrders(params.id);
});

// ------------------------------------------------------------------ dispatch
function match(method: string, path: string[]) {
  let methodMismatch = false;
  for (const route of routes) {
    if (route.segments.length !== path.length) continue;
    const params: Record<string, string> = {};
    const hit = route.segments.every((seg, i) => {
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decodeURIComponent(path[i]);
        return true;
      }
      return seg === path[i];
    });
    if (!hit) continue;
    if (route.method !== method) {
      methodMismatch = true;
      continue;
    }
    return { route, params };
  }
  return methodMismatch ? "method" : null;
}

/** Handles any request under /api/v1. */
export async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/v1\/?/, "").split("/").filter(Boolean);
  try {
    const found = match(request.method, path);
    if (found === "method") throw new HttpError(405, "Method not allowed", "METHOD_NOT_ALLOWED");
    if (!found) throw new HttpError(404, `Cannot ${request.method} ${url.pathname}`, "NOT_FOUND");
    const data = await found.route.handler({
      request,
      params: found.params,
      search: url.searchParams,
      body: async () => asObject(await request.json().catch(() => {
        throw badRequest("Request body must be valid JSON");
      })),
    });
    return ok(data, found.route.status);
  } catch (error) {
    return fail(error, url.pathname);
  }
}

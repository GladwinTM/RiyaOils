import { query } from "../db";
import type { HomeInsights, OilInsight, QualityBatch, QualityParameter } from "@/types/insights";

type OilRow = {
  slug: string;
  name: string;
  smoke_point_c: number | null;
  saturated_pct: string | null;
  mufa_pct: string | null;
  pufa_pct: string | null;
  flavor_note: string | null;
  best_for: string | null;
  source: string | null;
  units_in_stock: string;
  litres_in_stock: string;
  pack_sizes: string;
  min_price_per_litre: string | null;
};

type BatchRow = {
  batch_code: string;
  tested_on: Date;
  acid_value: string;
  peroxide_value: string;
  moisture_pct: string;
  lab_name: string | null;
  is_sample: boolean;
  product_name: string;
  product_slug: string;
  category_slug: string;
};

const toLitres = `(case v.unit when 'ml' then v.size/1000 when 'L' then v.size when 'g' then v.size/1000 when 'kg' then v.size end)`;

/** Everything the home page charts need, in one round of queries. */
export async function homeInsights(): Promise<HomeInsights> {
  const [oils, params, batches] = await Promise.all([
    query<OilRow>(
      `select c.slug, c.name,
         op.smoke_point_c, op.saturated_pct, op.mufa_pct, op.pufa_pct, op.flavor_note, op.best_for, op.source,
         coalesce(sum(v.stock) filter (where v.is_active and p.is_active), 0) units_in_stock,
         coalesce(sum(v.stock * ${toLitres}) filter (where v.is_active and p.is_active), 0) litres_in_stock,
         count(v.id) filter (where v.is_active and p.is_active) pack_sizes,
         min(coalesce(v.sale_price, v.price) / nullif(${toLitres}, 0)) filter (where v.is_active and p.is_active) min_price_per_litre
       from categories c
       left join oil_profiles op on op.category_id = c.id
       left join products p on p.category_id = c.id
       left join product_variants v on v.product_id = p.id
       where c.is_active
       group by c.id, op.id
       order by c.name`,
    ),
    query<QualityParameter & { max_limit: string }>(
      "select key,label,unit,max_limit,description,reference from quality_parameters order by sort_order",
    ),
    query<BatchRow>(
      `select e.batch_code, e.tested_on, e.acid_value, e.peroxide_value, e.moisture_pct, e.lab_name, e.is_sample,
         p.name product_name, p.slug product_slug, c.slug category_slug
       from quality_evaluations e
       join products p on p.id = e.product_id and p.is_active
       join categories c on c.id = p.category_id
       where e.is_published
       order by e.tested_on asc`,
    ),
  ]);

  const parameters: QualityParameter[] = params.rows.map((p) => ({ ...p, max_limit: Number(p.max_limit) }));
  const limits = Object.fromEntries(parameters.map((p) => [p.key, p.max_limit]));

  const qualityBatches: QualityBatch[] = batches.rows.map((b) => {
    const values = {
      acid_value: Number(b.acid_value),
      peroxide_value: Number(b.peroxide_value),
      moisture_pct: Number(b.moisture_pct),
    };
    // Headroom = how far below the reference limit each reading sits, averaged.
    const headrooms = Object.entries(values)
      .filter(([k]) => limits[k])
      .map(([k, v]) => Math.max(0, 1 - v / limits[k]));
    const score = headrooms.length ? Math.round((headrooms.reduce((a, b) => a + b, 0) / headrooms.length) * 100) : 0;
    return {
      batchCode: b.batch_code,
      testedOn: b.tested_on.toISOString().slice(0, 10),
      productName: b.product_name,
      productSlug: b.product_slug,
      categorySlug: b.category_slug,
      labName: b.lab_name,
      isSample: b.is_sample,
      values,
      score,
      passed: Object.entries(values).every(([k, v]) => !limits[k] || v <= limits[k]),
    };
  });

  const oilInsights: OilInsight[] = oils.rows.map((o) => ({
    slug: o.slug,
    name: o.name,
    profile:
      o.smoke_point_c === null
        ? null
        : {
            smokePointC: o.smoke_point_c,
            saturatedPct: Number(o.saturated_pct),
            mufaPct: Number(o.mufa_pct),
            pufaPct: Number(o.pufa_pct),
            flavorNote: o.flavor_note,
            bestFor: o.best_for,
            source: o.source,
          },
    unitsInStock: Number(o.units_in_stock),
    litresInStock: Math.round(Number(o.litres_in_stock) * 10) / 10,
    packSizes: Number(o.pack_sizes),
    minPricePerLitre: o.min_price_per_litre === null ? null : Math.round(Number(o.min_price_per_litre)),
  }));

  return {
    oils: oilInsights,
    parameters,
    batches: qualityBatches,
    summary: {
      oilCount: oilInsights.length,
      packSizes: oilInsights.reduce((n, o) => n + o.packSizes, 0),
      litresInStock: Math.round(oilInsights.reduce((n, o) => n + o.litresInStock, 0)),
      batchesTested: qualityBatches.length,
      passRate: qualityBatches.length
        ? Math.round((qualityBatches.filter((b) => b.passed).length / qualityBatches.length) * 100)
        : null,
      allSample: qualityBatches.length > 0 && qualityBatches.every((b) => b.isSample),
    },
  };
}

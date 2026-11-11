export type OilProfile = {
  smokePointC: number;
  saturatedPct: number;
  mufaPct: number;
  pufaPct: number;
  flavorNote: string | null;
  bestFor: string | null;
  source: string | null;
};

export type OilInsight = {
  slug: string;
  name: string;
  profile: OilProfile | null;
  unitsInStock: number;
  litresInStock: number;
  packSizes: number;
  minPricePerLitre: number | null;
};

export type QualityParameterKey = "acid_value" | "peroxide_value" | "moisture_pct";

export type QualityParameter = {
  key: QualityParameterKey | string;
  label: string;
  unit: string;
  max_limit: number;
  description: string | null;
  reference: string;
};

export type QualityBatch = {
  batchCode: string;
  testedOn: string;
  productName: string;
  productSlug: string;
  categorySlug: string;
  labName: string | null;
  isSample: boolean;
  values: Record<QualityParameterKey, number>;
  /** 0–100: average headroom below the reference limits. */
  score: number;
  passed: boolean;
};

export type HomeInsights = {
  oils: OilInsight[];
  parameters: QualityParameter[];
  batches: QualityBatch[];
  summary: {
    oilCount: number;
    packSizes: number;
    litresInStock: number;
    batchesTested: number;
    passRate: number | null;
    allSample: boolean;
  };
};

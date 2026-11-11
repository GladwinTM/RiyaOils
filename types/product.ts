export type ProductVariant = {
  id: string;
  product_id?: string;
  name: string;
  size: number | string;
  unit: string;
  sku: string;
  price: number | string;
  sale_price: number | string | null;
  stock: number | string;
  is_active: boolean;
};

export type ProductCategory = {
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  weight: string | null;
  ingredients: string | null;
  thumbnail_url: string | null;
  images: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  categories?: ProductCategory;
  product_variants: ProductVariant[];
};

export type ProductQuery = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

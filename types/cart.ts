export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  productName: string;
  variantName: string;
  image: string | null;
  price: number;
  quantity: number;
  stock: number;
};

export type CartState = {
  items: CartItem[];
};

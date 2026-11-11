export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
};

export type OrderStatusHistory = {
  id: string;
  status: OrderStatus | string;
  note: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus | string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  created_at: string;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
};

export type CreateOrderPayload = {
  items: { variantId: string; quantity: number }[];
  customer: { name: string; phone: string; email: string };
  shippingAddress: {
    addressLine: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
};

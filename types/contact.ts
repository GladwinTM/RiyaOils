export type ContactSettings = {
  id?: string;
  business_name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  google_maps_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  business_hours: string | null;
};

export type StoreSettings = {
  store_name: string;
  currency: string;
  shipping_fee: number | string;
  free_shipping_threshold: number | string;
  support_phone: string | null;
  support_email: string | null;
};

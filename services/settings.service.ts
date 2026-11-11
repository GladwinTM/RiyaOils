import { api } from "@/lib/api";
import type { StoreSettings } from "@/types/contact";

export function getStoreSettings() {
  return api<StoreSettings>("/settings");
}

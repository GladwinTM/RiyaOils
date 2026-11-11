import { api } from "@/lib/api";
import type { ContactSettings } from "@/types/contact";

export function getContactSettings() {
  return api<ContactSettings>("/content/contact");
}

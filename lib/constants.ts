export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const CART_STORAGE_KEY = "riya-cart";
export const GUEST_ORDERS_KEY = "riya-guest-orders";
export const ACCESS_TOKEN_KEY = "riya-access-token";

export const SEARCH_DEBOUNCE_MS = 350;
export const API_TIMEOUT_MS = 8_000;
/** Placing an order does several writes in one transaction; give it room. */
export const ORDER_TIMEOUT_MS = 30_000;
export const API_RETRY_COUNT = 2;

export const LOADING_MESSAGES = [
  "Loading the page…",
  "Almost there…",
  "Warming things up…",
  "Just a moment…",
  "Getting your oils ready…",
] as const;

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

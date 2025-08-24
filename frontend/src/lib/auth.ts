const KEY = "humandns_token";

export function setToken(t: string) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, t);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

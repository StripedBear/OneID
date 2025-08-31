const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export async function api<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");
  if (!(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: "no-store" });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const detail = (data && (data.detail || data.message)) || res.statusText;
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
    return data as T;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : "Network error");
  }
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://oneid-m4s5.onrender.com/api/v1";

// Types
export interface Group {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
  description?: string;
  sort_order?: number;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  sort_order?: number;
}

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

// Groups API
export const groupsApi = {
  async getGroups(token: string): Promise<Group[]> {
    return api<Group[]>("/groups", { method: "GET" }, token);
  },

  async createGroup(data: GroupCreate, token: string): Promise<Group> {
    return api<Group>("/groups", { method: "POST", body: JSON.stringify(data) }, token);
  },

  async updateGroup(id: number, data: GroupUpdate, token: string): Promise<Group> {
    return api<Group>(`/groups/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
  },

  async deleteGroup(id: number, token: string): Promise<void> {
    return api<void>(`/groups/${id}`, { method: "DELETE" }, token);
  },
};

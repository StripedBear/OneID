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

// Recovery types
export interface RecoveryStartRequest {
  email: string;
}

export interface RecoveryStartResponse {
  message: string;
  available_methods: string[];
  warning?: string;
}

export interface RecoveryVerifyRequest {
  email: string;
  method: string;
  code?: string;
  oauth_token?: string;
}

export interface RecoveryVerifyResponse {
  access_token: string;
  token_type: string;
  message: string;
}

export interface SecurityInfo {
  connected: number;
  total: number;
  methods: string[];
  level: string;
  recommendation: string;
}

export interface OTPRequest {
  email: string;
}

export interface OTPResponse {
  message: string;
  expires_in: number;
}

// Channel types
export interface ChannelCreate {
  type: string;
  value: string;
  label?: string;
  is_public: boolean;
  is_primary: boolean;
  sort_order: number;
  group_ids: number[];
}

export interface ChannelUpdate {
  type?: string;
  value?: string;
  label?: string;
  is_public?: boolean;
  is_primary?: boolean;
  sort_order?: number;
  group_ids?: number[];
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

// Recovery API
export const recoveryApi = {
  async startRecovery(data: RecoveryStartRequest): Promise<RecoveryStartResponse> {
    return api<RecoveryStartResponse>("/auth/recover", { 
      method: "POST", 
      body: JSON.stringify(data) 
    });
  },

  async verifyRecovery(data: RecoveryVerifyRequest): Promise<RecoveryVerifyResponse> {
    return api<RecoveryVerifyResponse>("/auth/verify", { 
      method: "POST", 
      body: JSON.stringify(data) 
    });
  },

  async sendOTP(data: OTPRequest): Promise<OTPResponse> {
    return api<OTPResponse>("/auth/otp", { 
      method: "POST", 
      body: JSON.stringify(data) 
    });
  },

  async getSecurityInfo(token: string): Promise<SecurityInfo> {
    return api<SecurityInfo>("/auth/security", { method: "GET" }, token);
  },
};

// Channels API
export const channelsApi = {
  async getChannels(token: string): Promise<Channel[]> {
    return api<Channel[]>("/channels", { method: "GET" }, token);
  },

  async createChannel(data: ChannelCreate, token: string): Promise<Channel> {
    return api<Channel>("/channels", { method: "POST", body: JSON.stringify(data) }, token);
  },

  async updateChannel(id: number, data: ChannelUpdate, token: string): Promise<Channel> {
    return api<Channel>(`/channels/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
  },

  async deleteChannel(id: number, token: string): Promise<void> {
    return api<void>(`/channels/${id}`, { method: "DELETE" }, token);
  },

  async removeChannelFromGroup(channelId: number, groupId: number, token: string): Promise<void> {
    return api<void>(`/channels/${channelId}/groups/${groupId}`, { method: "DELETE" }, token);
  },
};

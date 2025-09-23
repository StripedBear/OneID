export type UserPublic = {
  id: number;
  email: string;
  username: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
};

export type Channel = {
  id: number;
  user_id: number;
  group_id?: number | null;
  type: string;
  value: string;
  label?: string | null;
  is_public: boolean;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PublicProfile = {
  user: UserPublic;
  channels: Channel[];
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

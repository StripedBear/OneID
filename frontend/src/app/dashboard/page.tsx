"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { UserPublic, Channel } from "@/types";
import { ChannelIcon } from "@/components/ChannelIcon";
import AvatarButton from "@/components/AvatarButton";
import QRCodeCard from "@/components/QRCodeCard";
import Link from "next/link";


// Helper function to get display name
const getDisplayName = (user: UserPublic): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    return user.first_name;
  }
  if (user.last_name) {
    return user.last_name;
  }
  if (user.display_name) {
    return user.display_name;
  }
  return user.username;
};

type NewChannel = {
  type: string;
  value: string;
  label?: string;
  is_public: boolean;
  is_primary: boolean;
  sort_order: number;
};

const channelTypes = ["phone","email","telegram","whatsapp","signal","instagram","twitter","facebook","linkedin","website","github","custom"];

export default function DashboardPage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const load = useCallback(async (currentToken: string) => {
    try {
      const me = await api<UserPublic>("/auth/me", {}, currentToken);
      setUser(me);
      const list = await api<Channel[]>("/channels", {}, currentToken);
      setChannels(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize token and load data
  useEffect(() => {
    const currentToken = getToken();
    setToken(currentToken);
    
    if (currentToken) {
      load(currentToken);
    } else {
      setIsLoading(false);
    }
  }, [load]);

  const addChannel = useCallback(async (form: NewChannel) => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api<Channel>("/channels", { method:"POST", body: JSON.stringify(form) }, token);
      setChannels((prev) => [...prev, created].sort((a,b)=> (a.sort_order-b.sort_order) || (a.id-b.id)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, [token]);

  const removeChannel = useCallback(async (id: number) => {
    if (!token) return;
    setBusy(true);
    try {
      await api(`/channels/${id}`, { method:"DELETE" }, token);
      setChannels((prev)=> prev.filter(c=>c.id!==id));
    } finally {
      setBusy(false);
    }
  }, [token]);

  const updateAvatar = useCallback(async (newAvatarUrl: string) => {
    if (!token) return;
    try {
      console.log('updateAvatar called with:', newAvatarUrl);
      // Update local state immediately for better UX
      setUser(prev => {
        const updated = prev ? { ...prev, avatar_url: newAvatarUrl } : null;
        console.log('Updated user state:', updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  }, [token]);

  const updateProfile = useCallback(async (profileData: { first_name?: string; last_name?: string; display_name?: string; bio?: string }) => {
    if (!token) return;
    try {
      const response = await api<UserPublic>("/auth/profile", { 
        method: "PUT", 
        body: JSON.stringify(profileData) 
      }, token);
      
      setUser(response);
      setShowProfileEdit(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-slate-300">You are not logged in.</p>
          <Link className="underline text-blue-400 hover:text-blue-300" href="/login">Go to login page</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <AvatarButton 
                  currentAvatarUrl={user?.avatar_url || null} 
                  onAvatarUpdate={updateAvatar}
                  size="lg"
                />
                {user && (
                  <button
                    onClick={() => setShowQR(true)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                    title="Show QR code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-white">{user ? getDisplayName(user) : ''}</div>
                <div className="text-slate-400 text-sm">{user?.email}</div>
                {user && (
                  <div className="text-sm mt-2 text-slate-300">
                    Public profile:{" "}
                    <Link className="underline text-blue-400 hover:text-blue-300" href={`/${user.username}`} target="_blank" rel="noreferrer">
                      /{user.username}
                    </Link>
                  </div>
                )}
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-700 rounded-lg p-3">{error}</div>}

            <section className="grid gap-3">
              <h2 className="text-lg font-semibold text-white">My Channels</h2>
              <ul className="grid gap-2">
                {channels.map((ch) => (
                  <li key={ch.id} className="flex items-center gap-3 border border-slate-700 rounded-2xl p-3 bg-slate-800">
                    <ChannelIcon type={ch.type} />
                    <div className="flex-1">
                      <div className="font-medium text-white">{ch.label || ch.type}</div>
                      <div className="text-sm text-slate-400 break-all">{ch.value}</div>
                      <div className="text-xs text-slate-500">
                        {ch.is_public ? "Public" : "Private"} {ch.is_primary ? "• Primary" : ""} • Order: {ch.sort_order}
                      </div>
                    </div>
                    <button
                      onClick={() => removeChannel(ch.id)}
                      className="text-sm border border-slate-600 px-3 py-1 rounded-xl hover:bg-slate-700 text-slate-300"
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {channels.length === 0 && <li className="text-slate-400">No channels yet</li>}
              </ul>
            </section>

            <section className="grid gap-3">
              <h2 className="text-lg font-semibold text-white">Add Channel</h2>
              <ChannelForm onSubmit={addChannel} disabled={busy} />
            </section>

            {/* QR Code Modal */}
            {showQR && user && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowQR(false)}
              >
                <div 
                  className="bg-slate-800 p-6 rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <QRCodeCard 
                    url={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/${user.username}`}
                  />
                </div>
              </div>
            )}

            {/* Profile Edit Modal */}
            {showProfileEdit && user && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowProfileEdit(false)}
              >
                <div 
                  className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ProfileEditForm 
                    user={user} 
                    onSubmit={updateProfile} 
                    onCancel={() => setShowProfileEdit(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelForm({ onSubmit, disabled }: { onSubmit: (v: NewChannel) => void; disabled: boolean; }) {
  const [form, setForm] = useState({
    type: "telegram",
    value: "",
    label: "",
    is_public: true,
    is_primary: false,
    sort_order: 0
  });
  
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, sort_order: Number(form.sort_order) || 0 }); }}
      className="grid md:grid-cols-2 gap-3"
    >
      <select 
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
        value={form.type} 
        onChange={(e)=>setForm({...form, type:e.target.value})}
      >
        {channelTypes.map((t)=> <option key={t} value={t}>{t}</option>)}
      </select>
      <input 
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Value (phone, @handle, URL…)" 
        value={form.value} 
        onChange={(e)=>setForm({...form, value:e.target.value})} 
      />
      <input 
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Label (optional)" 
        value={form.label} 
        onChange={(e)=>setForm({...form, label:e.target.value})} 
      />
      <input 
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        type="number" 
        placeholder="Order" 
        value={form.sort_order} 
        onChange={(e)=>setForm({...form, sort_order:Number(e.target.value)})} 
      />
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={form.is_public} onChange={(e)=>setForm({...form, is_public:e.target.checked})} /> Public
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={form.is_primary} onChange={(e)=>setForm({...form, is_primary:e.target.checked})} /> Primary
      </label>
      <div className="md:col-span-2">
        <button 
          disabled={disabled} 
          className="w-full bg-white text-slate-900 py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          {disabled ? "Saving..." : "Add"}
        </button>
      </div>
    </form>
  );
}

function ProfileEditForm({ 
  user, 
  onSubmit, 
  onCancel 
}: { 
  user: UserPublic; 
  onSubmit: (data: { first_name?: string; last_name?: string; display_name?: string; bio?: string }) => void; 
  onCancel: () => void; 
}) {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    display_name: user.display_name || "",
    bio: user.bio || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center text-white">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">First Name</label>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => setForm({...form, first_name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Last Name</label>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => setForm({...form, last_name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Display Name (optional)</label>
          <input
            type="text"
            value={form.display_name}
            onChange={(e) => setForm({...form, display_name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Bio (optional)</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({...form, bio: e.target.value})}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { api, groupsApi, type Group, type GroupCreate } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { UserPublic, Channel } from "@/types";
import { ChannelIcon } from "@/components/ChannelIcon";
import AvatarButton from "@/components/AvatarButton";
import QRCodeCard from "@/components/QRCodeCard";
import Link from "next/link";
import { Plus, Edit3, Trash2, Users } from "lucide-react";

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
  group_id?: number | null;
};

const channelTypes = ["phone","email","telegram","whatsapp","signal","instagram","twitter","facebook","linkedin","website","github","custom"];

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const load = useCallback(async (currentToken: string) => {
    try {
      const me = await api<UserPublic>("/auth/me", {}, currentToken);
      setUser(me);
      const list = await api<Channel[]>("/channels", {}, currentToken);
      setChannels(list);
      const groupsList = await groupsApi.getGroups(currentToken);
      setGroups(groupsList);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize token and load data
  useEffect(() => {
    if (token && isAuthenticated) {
      load(token);
    } else {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, load]);

  const addChannel = useCallback(async (form: NewChannel) => {
    if (!token) return;
    
    // Basic validation
    if (!form.value.trim()) {
      setError('Value is required');
      return;
    }
    
    setBusy(true);
    setError(null);
    try {
      const created = await api<Channel>("/channels", { method:"POST", body: JSON.stringify(form) }, token);
      setChannels((prev) => [...prev, created].sort((a,b)=> (a.sort_order-b.sort_order) || (a.id-b.id)));
      setShowAddChannel(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create channel');
    } finally {
      setBusy(false);
    }
  }, [token]);

  const updateChannel = useCallback(async (id: number, form: NewChannel) => {
    if (!token) return;
    
    setBusy(true);
    setError(null);
    try {
      const updated = await api<Channel>(`/channels/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(form) 
      }, token);
      setChannels((prev) => prev.map(c => c.id === id ? updated : c));
      setEditingChannel(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update channel');
    } finally {
      setBusy(false);
    }
  }, [token]);

  const removeChannel = useCallback(async (id: number) => {
    if (!token) return;
    
    const channel = channels.find(c => c.id === id);
    const channelName = channel ? (channel.label || channel.type) : 'this channel';
    
    if (!confirm(`Are you sure you want to delete ${channelName}?`)) {
      return;
    }
    
    setBusy(true);
    try {
      await api(`/channels/${id}`, { method:"DELETE" }, token);
      setChannels((prev)=> prev.filter(c=>c.id!==id));
      setEditingChannel(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete channel');
    } finally {
      setBusy(false);
    }
  }, [token, channels]);

  // Group functions
  const addGroup = useCallback(async (form: GroupCreate) => {
    if (!token) return;
    
    if (!form.name.trim()) {
      setError('Group name is required');
      return;
    }
    
    setBusy(true);
    setError(null);
    try {
      const created = await groupsApi.createGroup(form, token);
      setGroups((prev) => [...prev, created].sort((a,b)=> (a.sort_order-b.sort_order) || (a.id-b.id)));
      setShowAddGroup(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create group';
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  }, [token]);

  const removeGroup = useCallback(async (id: number) => {
    if (!token) return;
    
    const group = groups.find(g => g.id === id);
    const groupName = group ? group.name : 'this group';
    
    if (!confirm(`Are you sure you want to delete ${groupName}? This will move all channels to "No Group".`)) {
      return;
    }
    
    setBusy(true);
    try {
      await groupsApi.deleteGroup(id, token);
      setGroups((prev)=> prev.filter(g=>g.id!==id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete group');
    } finally {
      setBusy(false);
    }
  }, [token, groups]);

  const updateAvatar = useCallback(async (newAvatarUrl: string) => {
    if (!token) return;
    try {
      console.log('updateAvatar called with:', newAvatarUrl);
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

  // Group channels by group_id or create default groups
  const groupedChannels = channels.reduce((acc, channel) => {
    const groupId = channel.group_id;
    const group = groups.find(g => g.id === groupId);
    const groupName = group ? group.name : 'No Group';
    
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

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

  if (!isAuthenticated) {
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
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Profile Section */}
          <div className="p-6 border-b border-slate-700">
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
                <div className="text-lg font-semibold text-white">{user ? getDisplayName(user) : ''}</div>
                <div className="text-slate-400 text-sm">{user?.email}</div>
                {user && (
                  <div className="text-xs mt-2 text-slate-300">
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
          </div>

          {/* Groups Section */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-300">Groups</h3>
            </div>
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between text-sm text-slate-400 py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors">
                  <span>
                    {group.name} ({groupedChannels[group.name]?.length || 0})
                  </span>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete group"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {groupedChannels['No Group'] && (
                <div className="text-sm text-slate-400 py-2 px-3 rounded-lg">
                  No Group ({groupedChannels['No Group'].length})
                </div>
              )}
            </div>
          </div>

          {/* Add Channel Button */}
          <div className="p-6 border-t border-slate-700 space-y-3">
            <button
              onClick={() => setShowAddChannel(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Add Channel
            </button>
            <button
              onClick={() => setShowAddGroup(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Add Group
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {error && (
              <div className="mb-6 text-red-400 text-sm bg-red-900/20 border border-red-700 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Channel Groups */}
            <div className="space-y-8">
              {Object.entries(groupedChannels).map(([groupName, groupChannels]) => (
                <div key={groupName} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h2 className="text-xl font-semibold text-white mb-6">{groupName}</h2>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {groupChannels.map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => setEditingChannel(channel)}
                        className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105 border border-slate-600 hover:border-slate-500"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center">
                            <ChannelIcon type={channel.type} />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-300 font-medium">{channel.label || channel.type}</div>
                            <div className="text-xs text-slate-400 truncate w-full">{channel.value}</div>
                            <div className="flex gap-1 mt-1">
                              {channel.is_public && (
                                <span className="text-xs bg-green-600 text-white px-1 rounded">P</span>
                              )}
                              {channel.is_primary && (
                                <span className="text-xs bg-blue-600 text-white px-1 rounded">★</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {channels.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-slate-400 mb-4">No channels yet</div>
                  <button
                    onClick={() => setShowAddChannel(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                  >
                    Add your first channel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

      {/* Add Channel Modal */}
      {showAddChannel && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddChannel(false)}
        >
          <div 
            className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ChannelForm 
              onSubmit={addChannel} 
              onCancel={() => setShowAddChannel(false)}
              disabled={busy}
              groups={groups}
            />
          </div>
        </div>
      )}

      {/* Edit Channel Modal */}
      {editingChannel && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingChannel(null)}
        >
          <div 
            className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ChannelForm 
              channel={editingChannel}
              onSubmit={(form) => updateChannel(editingChannel.id!, form)} 
              onCancel={() => setEditingChannel(null)}
              onDelete={() => removeChannel(editingChannel.id!)}
              disabled={busy}
              groups={groups}
            />
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddGroup(false)}
        >
          <div 
            className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <GroupForm 
              onSubmit={addGroup} 
              onCancel={() => setShowAddGroup(false)}
              disabled={busy}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelForm({ 
  channel, 
  onSubmit, 
  onCancel, 
  onDelete,
  disabled,
  groups
}: { 
  channel?: Channel;
  onSubmit: (form: NewChannel) => void; 
  onCancel: () => void;
  onDelete?: () => void;
  disabled: boolean;
  groups: Group[];
}) {
  const [form, setForm] = useState({
    type: channel?.type || "telegram",
    value: channel?.value || "",
    label: channel?.label || "",
    is_public: channel?.is_public ?? true,
    is_primary: channel?.is_primary ?? false,
    sort_order: channel?.sort_order || 0,
    group_id: channel?.group_id || null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, sort_order: Number(form.sort_order) || 0 });
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center text-white">
        {channel ? 'Edit Channel' : 'Add Channel'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Channel Type</label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={form.type} 
            onChange={(e)=>setForm({...form, type:e.target.value})}
          >
            {channelTypes.map((t)=> <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-2">Value (phone, @handle, URL...)</label>
          <input 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter value" 
            value={form.value} 
            onChange={(e)=>setForm({...form, value:e.target.value})} 
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-2">Label (optional)</label>
          <input 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter label" 
            value={form.label} 
            onChange={(e)=>setForm({...form, label:e.target.value})} 
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-2">Group</label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={form.group_id || ""} 
            onChange={(e)=>setForm({...form, group_id: e.target.value ? Number(e.target.value) : null})}
          >
            <option value="">No Group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-2">Order</label>
          <input 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            type="number" 
            placeholder="0" 
            value={form.sort_order} 
            onChange={(e)=>setForm({...form, sort_order:Number(e.target.value)})} 
          />
        </div>
        
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input 
              type="checkbox" 
              checked={form.is_public} 
              onChange={(e)=>setForm({...form, is_public:e.target.checked})} 
              className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
            /> 
            Public
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input 
              type="checkbox" 
              checked={form.is_primary} 
              onChange={(e)=>setForm({...form, is_primary:e.target.checked})} 
              className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
            /> 
            Primary
          </label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
          <button 
            type="submit"
            disabled={disabled} 
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {disabled ? "Saving..." : (channel ? "Update" : "Add")}
          </button>
        </div>
      </form>
    </div>
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

function GroupForm({ 
  onSubmit, 
  onCancel,
  disabled 
}: { 
  onSubmit: (form: GroupCreate) => void; 
  onCancel: () => void;
  disabled: boolean; 
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    sort_order: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, sort_order: Number(form.sort_order) || 0 });
    // Reset form after submission
    setForm({
      name: "",
      description: "",
      sort_order: 0
    });
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Add New Group</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Group Name</label>
          <input 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter group name" 
            value={form.name} 
            onChange={(e)=>setForm({...form, name:e.target.value})} 
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-2">Description (optional)</label>
          <textarea 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter description" 
            value={form.description} 
            onChange={(e)=>setForm({...form, description:e.target.value})}
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-2">Sort Order</label>
          <input 
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            type="number" 
            placeholder="0" 
            value={form.sort_order} 
            onChange={(e)=>setForm({...form, sort_order:Number(e.target.value)})} 
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
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {disabled ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
}
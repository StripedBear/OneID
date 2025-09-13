"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PublicProfile } from "@/types";
import { ChannelIcon } from "@/components/ChannelIcon";
import Avatar from "@/components/Avatar";
import CopyButton from "@/components/CopyButton";

interface UserProfileProps {
  params: {
    username: string;
  };
}

// Helper function to get display name
const getDisplayName = (user: any): string => {
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

export default function UserProfile({ params }: UserProfileProps) {
  const { username } = params;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api<PublicProfile>(`/public/${username}`);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Профиль не найден</h1>
          <p className="text-slate-300">Пользователь @{username} не существует</p>
        </div>
      </div>
    );
  }

  const { user, channels } = profile;
  const publicChannels = channels.filter(ch => ch.is_public);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <Avatar 
              src={user.avatar_url || null} 
              alt={getDisplayName(user)} 
              size={96}
            />
            <h1 className="text-3xl font-bold text-white mt-4 mb-2">
              {getDisplayName(user)}
            </h1>
            <p className="text-slate-300 mb-2">@{user.username}</p>
            {user.bio && (
              <p className="text-slate-400 mb-8">{user.bio}</p>
            )}
            
            <div className="mb-6">
              <CopyButton 
                value={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/${user.username}`}
              />
            </div>
            
            {publicChannels.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Каналы связи</h2>
                {publicChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center gap-3 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
                    <ChannelIcon type={channel.type} />
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {channel.label || channel.type}
                      </div>
                      <div className="text-sm text-slate-300 break-all">
                        {channel.value}
                      </div>
                    </div>
                    <CopyButton value={channel.value} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400">
                <p>У пользователя пока нет публичных каналов связи</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
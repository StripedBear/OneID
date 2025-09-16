"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PublicProfile } from "@/types";
import Avatar from "@/components/Avatar";
import CopyButton from "@/components/CopyButton";
import SocialChannel from "@/components/SocialChannel";
import QRCode from "react-qr-code";

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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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
      <div className="bg-slate-900 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-slate-900 flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile not found</h1>
          <p className="text-slate-300">User @{username} does not exist</p>
        </div>
      </div>
    );
  }

  const { user, channels } = profile;
  const publicChannels = channels.filter(ch => ch.is_public);

  return (
    <div className="bg-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            {/* Avatar with QR and Copy buttons - CENTERED LAYOUT */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Avatar with QR overlay - CENTER */}
              <div className="relative flex-shrink-0">
                <Avatar 
                  src={user.avatar_url || null} 
                  alt={getDisplayName(user)} 
                  size={120}
                />
                {/* QR icon overlay - BOTTOM RIGHT */}
                <button 
                  onClick={() => setIsQrModalOpen(true)}
                  className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 rounded-full p-2 border-2 border-white shadow-lg transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
              
              {/* Copy button - RIGHT SIDE */}
              <div className="flex-shrink-0">
                <CopyButton 
                  value={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/${user.username}`}
                  size="sm"
                />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {getDisplayName(user)}
            </h1>
            <p className="text-slate-300 mb-2">@{user.username}</p>
            {user.bio && (
              <p className="text-slate-400 mb-8">{user.bio}</p>
            )}
            
            {publicChannels.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Contact Channels</h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 justify-items-center">
                  {publicChannels.map((channel) => (
                    <SocialChannel key={channel.id} channel={channel} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-400">
                <p>User has no public contact channels yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* QR Code */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                QR Code
              </h3>
              <div className="flex justify-center mb-4">
                <QRCode 
                  value={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/${user.username}`}
                  size={200}
                  className="rounded-lg"
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Scan to visit profile
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
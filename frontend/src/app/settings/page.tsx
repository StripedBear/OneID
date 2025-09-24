"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, recoveryApi } from "@/lib/api";
import type { UserPublic, SecurityInfo } from "@/types";
import Link from "next/link";
import { ArrowLeft, User, Shield, Trash2, Settings } from "lucide-react";

export default function SettingsPage() {
  const { token, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && token) {
      loadData();
    }
  }, [isAuthenticated, token]);

  const loadData = async () => {
    if (!token) return;
    
    try {
      const [userData, securityData] = await Promise.all([
        api<UserPublic>("/auth/me", {}, token),
        recoveryApi.getSecurityInfo(token)
      ]);
      
      setUser(userData);
      setSecurityInfo(securityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading settings...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-slate-300">You are not logged in.</p>
          <Link className="underline text-blue-400 hover:text-blue-300" href="/login">Go to login page</Link>
        </div>
      </div>
    );
  }

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {/* Profile Section */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={20} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Profile</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Username</h3>
                <p className="text-white">{user?.username}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Email</h3>
                <p className="text-white">{user?.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Display Name</h3>
                <p className="text-white">{user?.display_name || "Not set"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Full Name</h3>
                <p className="text-white">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : "Not set"
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <Settings size={16} />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h2 className="text-xl font-semibold text-white">Security</h2>
            </div>
            
            {securityInfo && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Security Level</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getSecurityLevelColor(securityInfo.level)}`}>
                      {securityInfo.connected}/{securityInfo.total}
                    </span>
                    <span className={`text-sm ${getSecurityLevelColor(securityInfo.level)}`}>
                      {securityInfo.level.charAt(0).toUpperCase() + securityInfo.level.slice(1)} Security
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Connected Methods</h3>
                  <p className="text-white">
                    {securityInfo.methods.length} of {securityInfo.total} login methods connected
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <Link 
                href="/settings/security" 
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300"
              >
                <Shield size={16} />
                Manage Security Settings
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-red-900/20">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={20} className="text-red-400" />
              <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Delete Account</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Link 
                  href="/settings/delete-account" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

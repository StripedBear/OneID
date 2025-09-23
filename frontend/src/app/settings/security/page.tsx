"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { recoveryApi, SecurityInfo } from "@/lib/api";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import Link from "next/link";

const SECURITY_METHODS = {
  email: { name: "Email", icon: "📧", description: "Password login" },
  google: { name: "Google", icon: "🔍", description: "OAuth login" },
  github: { name: "GitHub", icon: "🐙", description: "OAuth login" },
  discord: { name: "Discord", icon: "💬", description: "OAuth login" },
  telegram: { name: "Telegram", icon: "✈️", description: "OAuth login" }
};

export default function SecuritySettingsPage() {
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    loadSecurityInfo();
  }, [token]);

  const loadSecurityInfo = async () => {
    if (!token) return;
    
    try {
      const info = await recoveryApi.getSecurityInfo(token);
      setSecurityInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security info");
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const getSecurityLevelText = (level: string) => {
    switch (level) {
      case "high": return "High Security";
      case "medium": return "Medium Security";
      case "low": return "Low Security";
      default: return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading security settings...</div>
      </div>
    );
  }

  if (!securityInfo) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-red-400">Failed to load security settings</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
          <p className="text-slate-400">Manage your account security and login methods</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Security Overview */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Security Overview</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl font-bold ${getSecurityLevelColor(securityInfo.level)}`}>
                  {securityInfo.connected}/{securityInfo.total}
                </span>
                <span className={`font-medium ${getSecurityLevelColor(securityInfo.level)}`}>
                  {getSecurityLevelText(securityInfo.level)}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {securityInfo.connected} of {securityInfo.total} login methods connected
              </p>
            </div>
            
            <div>
              <p className="text-slate-300 text-sm mb-2">
                {securityInfo.recommendation}
              </p>
              {securityInfo.connected < 3 && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ We recommend connecting at least 3 login methods for account recovery
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connected Methods */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connected Login Methods</h2>
          
          {securityInfo.methods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No login methods connected</p>
              <p className="text-slate-500 text-sm">
                Connect at least one method to secure your account
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {securityInfo.methods.map((method) => {
                const methodInfo = SECURITY_METHODS[method as keyof typeof SECURITY_METHODS];
                if (!methodInfo) return null;
                
                return (
                  <div
                    key={method}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{methodInfo.icon}</span>
                      <div>
                        <div className="font-medium text-white">{methodInfo.name}</div>
                        <div className="text-sm text-slate-400">{methodInfo.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm">✓ Connected</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Methods */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Add Login Methods</h2>
          
          <div className="grid gap-3">
            {Object.entries(SECURITY_METHODS).map(([method, info]) => {
              const isConnected = securityInfo.methods.includes(method);
              
              return (
                <div
                  key={method}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isConnected 
                      ? "bg-slate-700 opacity-60" 
                      : "bg-slate-700 hover:bg-slate-600 transition-colors"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <div className="font-medium text-white">{info.name}</div>
                      <div className="text-sm text-slate-400">{info.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <span className="text-green-400 text-sm">✓ Connected</span>
                    ) : (
                      <button
                        onClick={() => {
                          if (method === "email") {
                            // Redirect to registration page for email setup
                            window.location.href = "/register";
                          } else {
                            // Redirect to OAuth provider
                            window.location.href = `/api/v1/oauth/${method}`;
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery Information */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Recovery</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h3 className="font-medium text-blue-400 mb-2">How Recovery Works</h3>
              <p className="text-slate-300 text-sm">
                If you lose access to your account, you can recover it using any of your connected login methods. 
                The more methods you have connected, the easier it will be to recover your account.
              </p>
            </div>
            
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <h3 className="font-medium text-green-400 mb-2">Recovery Process</h3>
              <p className="text-slate-300 text-sm">
                1. Go to the login page and click "Forgot access? Recover"<br/>
                2. Enter your email address<br/>
                3. Choose a recovery method (email OTP or OAuth)<br/>
                4. Follow the verification steps<br/>
                5. Access your account with a new token
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/dashboard" 
            className="text-slate-400 hover:text-slate-300 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

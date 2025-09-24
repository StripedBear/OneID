"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";

export default function DeleteAccountPage() {
  const { token, clearToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const expectedText = "DELETE MY ACCOUNT";
  const isConfirmValid = confirmText === expectedText;

  const handleDeleteAccount = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    setError("");
    
    try {
      await api("/auth/delete-account", {
        method: "DELETE",
      }, token);
      
      // Clear token and redirect
      clearToken();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/settings" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Delete Account</h1>
          <p className="text-slate-400">Permanently delete your account and all data</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl p-6 border border-red-900/20">
          {/* Warning */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <AlertTriangle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-medium mb-2">This action cannot be undone</h3>
              <p className="text-slate-300 text-sm">
                This will permanently delete your account, profile, channels, groups, contacts, 
                and all associated data. You will lose access to all your information and 
                will not be able to recover it.
              </p>
            </div>
          </div>

          {/* What will be deleted */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">What will be deleted:</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                Your profile information (name, bio, avatar)
              </li>
              <li className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                All your communication channels
              </li>
              <li className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                All your contact groups
              </li>
              <li className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                Your contact list and saved contacts
              </li>
              <li className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                Your account settings and preferences
              </li>
              <li className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-400" />
                All login methods and security settings
              </li>
            </ul>
          </div>

          {/* Confirmation */}
          {!showConfirmation ? (
            <div className="space-y-4">
              <p className="text-slate-300">
                If you're sure you want to delete your account, click the button below to proceed 
                with the confirmation step.
              </p>
              
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                I want to delete my account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type <code className="bg-slate-700 px-2 py-1 rounded text-red-400">{expectedText}</code> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type the confirmation text"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmText("");
                  }}
                  className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmValid || isDeleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Account Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alternative actions */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-4">
            Not sure? Consider these alternatives:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/settings/security" 
              className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Update Security Settings
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

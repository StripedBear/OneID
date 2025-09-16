"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Avatar from "@/components/Avatar";

interface SearchUser {
  id: number;
  username: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_contact: boolean;
}

// Helper function to get display name
const getDisplayName = (user: SearchUser): string => {
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

export default function AddContactPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = getToken();


  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!token || searchQuery.length < 2) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await api<{ users: SearchUser[] }>(`/contacts/search?q=${encodeURIComponent(searchQuery)}`, {}, token);
      setSearchResults(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  const addContact = useCallback(async (userId: number) => {
    if (!token) return;
    
    setIsAdding(userId);
    setError(null);
    
    try {
      await api(`/contacts/add/${userId}`, { method: "POST" }, token);
      
      // Update the search results to reflect the new contact status
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_contact: true } : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    } finally {
      setIsAdding(null);
    }
  }, [token]);

  const handleSearch = () => {
    if (query.trim().length >= 2) {
      searchUsers(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
    <div className="bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Add Contact</h1>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username..."
                className="flex-1 border border-slate-600 rounded-lg px-4 py-2 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || query.trim().length < 2}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            {error && (
              <div className="p-4 border border-red-700 rounded-lg bg-red-900/20 text-red-400">
                {error}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Search Results:</h3>
                {searchResults.map((user) => (
                  <div key={user.id} className="p-4 border border-slate-700 rounded-lg flex items-center justify-between bg-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={user.avatar_url || null} 
                        alt={getDisplayName(user)} 
                        size={48}
                        clickable={false}
                      />
                      <div>
                        <div className="font-semibold text-white">{getDisplayName(user)}</div>
                        <div className="text-slate-400 text-sm">@{user.username}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => addContact(user.id)}
                      disabled={user.is_contact || isAdding === user.id}
                      className={`px-4 py-2 rounded-lg text-white transition-colors ${
                        user.is_contact 
                          ? 'bg-green-600 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                      }`}
                    >
                      {user.is_contact ? 'In contacts' : (isAdding === user.id ? 'Adding...' : 'Add')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {query.trim().length >= 2 && searchResults.length === 0 && !isSearching && !error && (
              <div className="p-4 border border-slate-700 rounded-lg text-center text-slate-400 bg-slate-800">
                User not found
              </div>
            )}

            <div>
              <Link href="/dashboard/contacts" className="text-sm text-blue-400 hover:text-blue-300 underline">
                ← Back to contacts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

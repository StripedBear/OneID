"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
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
  const { t } = useI18n();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
  }, [token, router]);

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
    return null; // Will redirect to login
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("add_contact_title")}</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t("add_contact_search_placeholder")}
          className="flex-1 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || query.trim().length < 2}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? "Поиск..." : t("add_contact_search")}
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-300 dark:border-red-700 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Результаты поиска:</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={user.avatar_url || null} 
                  alt={getDisplayName(user)} 
                  size={48}
                  clickable={false}
                />
                <div>
                  <div className="font-semibold">{getDisplayName(user)}</div>
                  <div className="text-slate-500 text-sm">@{user.username}</div>
                </div>
              </div>
              <button
                onClick={() => addContact(user.id)}
                disabled={user.is_contact || isAdding === user.id}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  user.is_contact 
                    ? 'bg-green-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                }`}
              >
                {user.is_contact ? 'В контактах' : (isAdding === user.id ? 'Добавляю...' : 'Добавить')}
              </button>
            </div>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && searchResults.length === 0 && !isSearching && !error && (
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-md text-center text-slate-500">
          {t("add_contact_user_not_found")}
        </div>
      )}

      <div>
        <Link href="/dashboard/contacts" className="text-sm text-blue-600 hover:underline">
          {t("add_contact_back")}
        </Link>
      </div>
    </div>
  );
}

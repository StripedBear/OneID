"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Avatar from "@/components/Avatar";

interface Contact {
  id: number;
  username: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  contact_id: number;
  added_at: string;
}

// Helper function to get display name
const getDisplayName = (contact: Contact): string => {
  if (contact.first_name && contact.last_name) {
    return `${contact.first_name} ${contact.last_name}`;
  }
  if (contact.first_name) {
    return contact.first_name;
  }
  if (contact.last_name) {
    return contact.last_name;
  }
  if (contact.display_name) {
    return contact.display_name;
  }
  return contact.username;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = getToken();

  const loadContacts = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api<{ contacts: Contact[] }>("/contacts", {}, token);
      setContacts(response.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadContacts();
    }
  }, [token, loadContacts]);

  const removeContact = useCallback(async (userId: number) => {
    if (!token) return;
    
    setIsRemoving(userId);
    setError(null);
    
    try {
      await api(`/contacts/remove/${userId}`, { method: "DELETE" }, token);
      
      // Remove from local state
      setContacts(prev => prev.filter(contact => contact.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove contact');
    } finally {
      setIsRemoving(null);
    }
  }, [token]);

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

  const filtered = contacts.filter((contact) => {
    const displayName = getDisplayName(contact).toLowerCase();
    const username = contact.username.toLowerCase();
    const searchTerm = search.toLowerCase();
    return displayName.includes(searchTerm) || username.includes(searchTerm);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Contacts</h1>
              </div>
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-2 text-slate-300">Loading contacts...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Contacts</h1>
              <Link
                href="/dashboard/contacts/add"
                className="inline-flex items-center gap-2 text-sm border border-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </Link>
            </div>

            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full border border-slate-600 rounded-lg px-4 py-2 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {error && (
              <div className="p-4 border border-red-700 rounded-lg bg-red-900/20 text-red-400">
                {error}
              </div>
            )}

            {filtered.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-slate-400">
                {search ? 'No contacts found' : 'You have no contacts yet'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col items-center gap-3 p-4 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors bg-slate-800"
                  >
                    <Link
                      href={`/${contact.username}`}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <Avatar 
                        src={contact.avatar_url || null} 
                        alt={getDisplayName(contact)} 
                        size={64}
                      />
                      <div className="text-center">
                        <div className="font-semibold text-sm text-white">{getDisplayName(contact)}</div>
                        <div className="text-xs text-slate-400">@{contact.username}</div>
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => removeContact(contact.id)}
                      disabled={isRemoving === contact.id}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                      title="Remove from contacts"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

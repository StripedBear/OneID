"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

type Contact = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const token = getToken();
  const { t } = useI18n();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    
    // TODO: Replace with real API request
    setContacts([
      { username: "alice", displayName: "Alice", avatarUrl: null },
      { username: "bob", displayName: "Bob", avatarUrl: null },
      { username: "charlie", displayName: "Charlie", avatarUrl: null },
    ]);
  }, [token, router]);

  if (!token) {
    return null; // Will redirect to login
  }

  const filtered = contacts.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("contacts_title")}</h1>
        <Link
          href="/dashboard/contacts/add"
          className="inline-flex items-center gap-2 text-sm border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          {t("contacts_add")}
        </Link>
      </div>
      <input
        type="text"
        placeholder={t("contacts_search_placeholder")}
        className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((contact) => (
          <Link
            key={contact.username}
            href={`/${contact.username}`}
            className="flex flex-col items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-4 rounded-xl transition"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              {contact.avatarUrl ? (
                <Image
                  src={contact.avatarUrl}
                  alt={contact.displayName}
                  width={80}
                  height={80}
                />
              ) : (
                <span className="text-xl font-bold text-slate-500 dark:text-slate-300">
                  {contact.displayName[0]}
                </span>
              )}
            </div>
            <span className="text-sm">{contact.displayName}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

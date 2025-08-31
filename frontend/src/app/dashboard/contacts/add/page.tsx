"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function AddContactPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<null | { username: string; displayName: string }>(null);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const token = getToken();
  const { t } = useI18n();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
  }, [token, router]);

  if (!token) {
    return null; // Will redirect to login
  }

  const handleSearch = () => {
    // Search placeholder
    const fakeUsers = [
      { username: "alice", displayName: "Alice" },
      { username: "bob", displayName: "Bob" },
    ];
    const found = fakeUsers.find((u) =>
      u.displayName.toLowerCase().includes(query.toLowerCase())
    );
    setResult(found || null);
    setNotFound(!found);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("add_contact_title")}</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t("add_contact_search_placeholder")}
          className="flex-1 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {t("add_contact_search")}
        </button>
      </div>

      {result && (
        <div className="p-4 border rounded-md flex items-center justify-between">
          <div>
            <div className="font-semibold">{result.displayName}</div>
            <div className="text-slate-500 text-sm">@{result.username}</div>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => alert(`Contact ${result.username} added (placeholder)`)}
          >
            Add
          </button>
        </div>
      )}

      {notFound && (
        <div className="p-4 border rounded-md text-center text-slate-500">
          {t("add_contact_user_not_found")}
          <div className="mt-2">
            <button
              className="text-blue-600 underline"
              onClick={() => alert("Invitation sent (placeholder)")}
            >
              {t("add_contact_invite")}
            </button>
          </div>
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

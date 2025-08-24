"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddContactPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<null | { username: string; displayName: string }>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    // Заглушка поиска
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
      <h1 className="text-2xl font-bold">Добавить контакт</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Имя или username..."
          className="flex-1 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Найти
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
            onClick={() => alert(`Контакт ${result.username} добавлен (заглушка)`)}
          >
            Добавить
          </button>
        </div>
      )}

      {notFound && (
        <div className="p-4 border rounded-md text-center text-slate-500">
          Пользователь не найден
          <div className="mt-2">
            <button
              className="text-blue-600 underline"
              onClick={() => alert("Приглашение отправлено (заглушка)")}
            >
              Пригласить
            </button>
          </div>
        </div>
      )}

      <div>
        <Link href="/dashboard/contacts" className="text-sm text-blue-600 hover:underline">
          ← Назад к контактам
        </Link>
      </div>
    </div>
  );
}

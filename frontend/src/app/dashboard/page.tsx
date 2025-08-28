"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import type { UserPublic, Channel } from "@/types";
import Avatar from "@/components/Avatar";
import { ChannelIcon } from "@/components/ChannelIcon";
import Link from "next/link";
import { t } from "@/lib/i18n";

type NewChannel = {
  type: string;
  value: string;
  label?: string;
  is_public: boolean;
  is_primary: boolean;
  sort_order: number;
};

const channelTypes = ["phone","email","telegram","whatsapp","signal","instagram","twitter","facebook","linkedin","website","github","custom"];

export default function DashboardPage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const token = getToken();

  async function load() {
    if (!token) return;
    try {
      const me = await api<UserPublic>("/auth/me", {}, token);
      setUser(me);
      const list = await api<Channel[]>("/channels", {}, token);
      setChannels(list);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function addChannel(form: NewChannel) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api<Channel>("/channels", { method:"POST", body: JSON.stringify(form) }, token);
      setChannels((prev) => [...prev, created].sort((a,b)=> (a.sort_order-b.sort_order) || (a.id-b.id)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeChannel(id: number) {
    if (!token) return;
    setBusy(true);
    try {
      await api(`/channels/${id}`, { method:"DELETE" }, token);
      setChannels((prev)=> prev.filter(c=>c.id!==id));
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto">
        <p className="mb-4">Вы не вошли в систему.</p>
        <Link className="underline" href="/login">Перейти на страницу входа</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Avatar src={user?.avatar_url ?? null} alt={user?.display_name || user?.username || "user"} size={64} />
        <div>
          <div className="text-xl font-semibold">{user?.display_name || user?.username}</div>
          <div className="text-slate-400 text-sm">{user?.email}</div>
          {user && (
            <div className="text-sm mt-2">
              Публичный профиль:{" "}
              <Link className="underline" href={`/${user.username}`} target="_blank" rel="noreferrer">
                /{user.username}
              </Link>
            </div>
          )}
        </div>
        <div className="flex-1" />
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">{t("dashboard_my_channels")}</h2>
        <ul className="grid gap-2">
          {channels.map((ch) => (
            <li key={ch.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
              <ChannelIcon type={ch.type} />
              <div className="flex-1">
                <div className="font-medium">{ch.label || ch.type}</div>
                <div className="text-sm text-slate-400 break-all">{ch.value}</div>
                <div className="text-xs text-slate-500">
                  {ch.is_public ? "Публичный" : "Скрытый"} {ch.is_primary ? "• Основной" : ""} • Порядок: {ch.sort_order}
                </div>
              </div>
              <button
                onClick={() => removeChannel(ch.id)}
                className="text-sm border border-slate-700 px-3 py-1 rounded-xl hover:bg-slate-800"
                disabled={busy}
              >
                {t("dashboard_delete")}
              </button>
            </li>
          ))}
          {channels.length === 0 && <li className="text-slate-400">Пока нет каналов</li>}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">{t("dashboard_add_channel")}</h2>
        <ChannelForm onSubmit={addChannel} disabled={busy} />
      </section>
    </div>
  );
}

function ChannelForm({ onSubmit, disabled }: { onSubmit: (v: any) => void; disabled: boolean; }) {
  const [form, setForm] = useState({
    type: "telegram",
    value: "",
    label: "",
    is_public: true,
    is_primary: false,
    sort_order: 0
  });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, sort_order: Number(form.sort_order) || 0 }); }}
      className="grid md:grid-cols-2 gap-3"
    >
      <select className="input" value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})}>
        {channelTypes.map((t)=> <option key={t} value={t}>{t}</option>)}
      </select>
      <input className="input" placeholder="Значение (телефон, @handle, URL…)" value={form.value} onChange={(e)=>setForm({...form, value:e.target.value})} />
      <input className="input" placeholder="Метка (опц.)" value={form.label} onChange={(e)=>setForm({...form, label:e.target.value})} />
      <input className="input" type="number" placeholder="Порядок" value={form.sort_order} onChange={(e)=>setForm({...form, sort_order:e.target.value as any})} />
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={form.is_public} onChange={(e)=>setForm({...form, is_public:e.target.checked})} /> Публичный
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={form.is_primary} onChange={(e)=>setForm({...form, is_primary:e.target.checked})} /> Основной
      </label>
      <div className="md:col-span-2">
        <button disabled={disabled} className="btn-primary">{disabled ? "Сохраняю..." : "Добавить"}</button>
      </div>
      <style jsx>{`
        .input { width: 100%; background:#0b1220; border:1px solid #1f2937; border-radius:14px; padding:10px 14px; }
        .btn-primary { background:white; color:#0b1220; border-radius:14px; padding:10px 14px; }
      `}</style>
    </form>
  );
}

import Avatar from "@/components/Avatar";
import { ChannelIcon } from "@/components/ChannelIcon";
import QRCodeCard from "@/components/QRCodeCard";
import QrModal from "@/components/QrModal";
import type { PublicProfile } from "@/types";
import { Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";


function normalizeHttpUrl(v: string): string {
  const x = v.trim();
  if (/^https?:\/\//i.test(x)) return x;
  if (x.startsWith("//")) return "https:" + x;
  return "https://" + x.replace(/^@/, "");
}

function hrefFor(type: string, value: string): string {
  const v = value.trim();
  switch (type) {
    case "phone": return `tel:${v}`;
    case "email": return `mailto:${v}`;
    case "telegram": return v.startsWith("http") ? v : `https://t.me/${v.replace(/^@/, "")}`;
    case "whatsapp": {
      const num = v.startsWith("http") ? v : v.replace(/[^\d]/g, "");
      return v.startsWith("http") ? v : `https://wa.me/${num}`;
    }
    case "signal": return v;
    default:
      return normalizeHttpUrl(v);
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  const res = await fetch(`${BASE}/public/${encodeURIComponent(username)}`, { cache: "no-store" });

  if (!res.ok) {
    return <div className="text-red-400">Профиль не найден</div>;
  }

  const data = (await res.json()) as PublicProfile;
  const publicUrl = `/${username}`;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Avatar src={data.user.avatar_url ?? null} alt={data.user.display_name || data.user.username} size={72} />
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{data.user.display_name || data.user.username}</h1>
          <QrModal url={typeof window !== "undefined" ? window.location.href : ""} />
        </div>
      </div>

      {data.user.bio && <p className="text-slate-300">{data.user.bio}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">Каналы связи</h2>
          <ul className="grid gap-2">
            {data.channels.map((ch) => {
              const href = hrefFor(ch.type, ch.value);
              const safeHref = (() => {
                try {
                  const u = new URL(href, "https://dummy.base");
                  return href;
                } catch {
                  return "#";
                }
              })();

              return (
                <li key={ch.id} className="flex items-center gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                  {/* Иконка-ссылка */}
                  <a href={safeHref} target="_blank" rel="noreferrer">
                    <ChannelIcon type={ch.type} className="w-6 h-6" />
                  </a>

                  {/* Кнопка копировать */}
                  <CopyButton value={ch.value} />


                  {/* Метаданные */}
                  <div className="flex-1">
                    <div className="font-medium">{ch.label || ch.type}</div>
                    <div className="text-xs text-slate-500">
                      {ch.is_public ? "Публичный" : "Скрытый"} {ch.is_primary ? "• Основной" : ""} • Порядок: {ch.sort_order}
                    </div>
                  </div>
                </li>
              );
            })}
            {data.channels.length === 0 && <li className="text-slate-400">У пользователя пока нет публичных каналов</li>}
          </ul>
        </section>

        <section>
          <QRCodeCard url={publicUrl} />
        </section>
      </div>
    </div>
  );
}

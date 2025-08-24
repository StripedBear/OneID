import Avatar from "@/components/Avatar";
import { ChannelIcon } from "@/components/ChannelIcon";
import QRCodeCard from "@/components/QRCodeCard";
import type { PublicProfile } from "@/types";

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
      // Для wa.me допустимы только цифры, уберём плюсы/скобки/пробелы
      const num = v.startsWith("http") ? v : v.replace(/[^\d]/g, "");
      return v.startsWith("http") ? v : `https://wa.me/${num}`;
    }
    case "signal": return v; // часто это deep-link из приложения — оставляем как есть
    case "instagram":
    case "twitter":
    case "facebook":
    case "linkedin":
    case "github":
    case "website":
    case "custom":
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

  // Для QR достаточно относительного пути — на клиенте он станет абсолютным
  const publicUrl = `/${username}`;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Avatar src={data.user.avatar_url ?? null} alt={data.user.display_name || data.user.username} size={72} />
        <div>
          <h1 className="text-2xl font-semibold">{data.user.display_name || data.user.username}</h1>
          {data.user.bio && <p className="text-slate-300">{data.user.bio}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">Каналы связи</h2>
          <ul className="grid gap-2">
            {data.channels.map((ch) => {
              const href = hrefFor(ch.type, ch.value);
              const safeHref = (() => {
                try {
                  // валидация для предотвращения ошибок вида "//:username"
                  const u = new URL(href, "https://dummy.base"); // базовый домен для относительных ссылок
                  return href;
                } catch {
                  return "#";
                }
              })();

              return (
                <li key={ch.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                  <ChannelIcon type={ch.type} />
                  <div className="flex-1">
                    <div className="font-medium">{ch.label || ch.type}</div>
                    <a
                      className="text-sm text-blue-600 dark:text-blue-300 hover:underline break-all"
                      href={safeHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {ch.value}
                    </a>
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

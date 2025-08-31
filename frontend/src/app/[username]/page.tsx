import Avatar from "@/components/Avatar";
import { ChannelIcon } from "@/components/ChannelIcon";
import type { PublicProfile } from "@/types";
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
    return <div className="text-red-400">Profile not found</div>;
  }

  const data = (await res.json()) as PublicProfile;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Avatar src={data.user.avatar_url ?? null} alt={data.user.display_name || data.user.username} size={72} />
        <div>
          <h1 className="text-2xl font-semibold">{data.user.display_name || data.user.username}</h1>
        </div>
      </div>

      {data.user.bio && <p className="text-slate-300">{data.user.bio}</p>}

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Contact Channels</h2>
        <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                <li key={ch.id} className="relative border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex flex-col items-center justify-center hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                {/* Icon-link */}
                                  <a href={safeHref} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center group">
                    <ChannelIcon type={ch.type} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
                  </a>

                {/* Copy button - positioned at top right */}
                <div className="absolute top-2 right-2">
                  <CopyButton value={ch.value} />
                </div>
              </li>
            );
          })}
          {data.channels.length === 0 && <li className="text-slate-400 col-span-full">User has no public channels yet</li>}
        </ul>
      </section>
    </div>
  );
}

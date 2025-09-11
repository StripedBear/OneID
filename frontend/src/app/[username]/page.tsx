"use client";

import React, { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { ChannelIcon } from "@/components/ChannelIcon";
import QRCodeCard from "@/components/QRCodeCard";
import type { PublicProfile } from "@/types";
import CopyButton from "@/components/CopyButton";

// Helper function to get display name
function getDisplayName(user: any): string {
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
}

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

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [showQR, setShowQR] = useState(false);
  const [data, setData] = useState<PublicProfile | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
      
      const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${BASE}/public/${encodeURIComponent(resolvedParams.username)}`, { cache: "no-store" });

      if (res.ok) {
        const profileData = await res.json() as PublicProfile;
        setData(profileData);
      }
    }
    
    loadData();
  }, [params]);

  if (!data) {
    return <div className="text-red-400">Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar src={data.user.avatar_url ?? null} alt={data.user.display_name || data.user.username} size={72} />
          <button
            onClick={() => setShowQR(true)}
            className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Show QR code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{getDisplayName(data.user)}</h1>
        </div>
      </div>

      {data.user.bio && <p className="text-slate-300">{data.user.bio}</p>}

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Contact Channels</h2>
        <ul className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {data.channels.map((ch) => {
            const href = hrefFor(ch.type, ch.value);
            const safeHref = (() => {
              try {
                new URL(href, "https://dummy.base");
                return href;
              } catch {
                return "#";
              }
            })();

            return (
              <li key={ch.id} className="relative border border-slate-200 dark:border-slate-800 rounded-lg p-2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex flex-col items-center justify-center hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                {/* Icon-link */}
                <a href={safeHref} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center group">
                  <ChannelIcon type={ch.type} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform" />
                </a>

                {/* Copy button - positioned at top right */}
                <div className="absolute top-1 right-1">
                  <CopyButton value={ch.value} />
                </div>
              </li>
            );
          })}
          {data.channels.length === 0 && <li className="text-slate-400 col-span-full">User has no public channels yet</li>}
        </ul>
      </section>

      {/* QR Code Modal */}
      {showQR && data && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeCard 
              url={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/${data.user.username}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

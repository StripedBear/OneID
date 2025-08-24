"use client";
import QRCode from "react-qr-code";

export default function QRCodeCard({ url }: { url: string }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Отсканируйте, чтобы открыть профиль</p>
      <div className="bg-white p-3 rounded-xl inline-block">
        <QRCode value={url} size={160} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 break-all">{url}</p>
    </div>
  );
}

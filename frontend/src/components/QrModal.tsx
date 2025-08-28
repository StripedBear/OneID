"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

export default function QrModal({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        title="Открыть QR"
      >
        <QrCode className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-[min(90vw,380px)]">
            <div className="text-lg font-semibold mb-4">Отсканируйте QR-код</div>
            <div className="bg-white p-3 rounded-xl inline-block mx-auto">
              <QRCode value={url || ""} size={220} />
            </div>
            <div className="mt-4 text-center text-sm text-slate-500 break-all">{url}</div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

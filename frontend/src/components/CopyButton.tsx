'use client';

import { Copy } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-slate-100"
      title="Скопировать"
    >
      <Copy className="w-5 h-5" />
    </button>
  );
}
